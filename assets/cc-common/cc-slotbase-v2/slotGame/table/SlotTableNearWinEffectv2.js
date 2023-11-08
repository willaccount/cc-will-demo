

cc.Class({
    extends: cc.Component,
    properties: {
        startAtScatterCount: 2,
        startAtBonusCount: 2,
        startAtJackpotCount: 4,
        stopAtScatterCount: 99,
        stopAtBonusCount: 99,
        reelParticle: cc.Node,
        sfxNearWin: {
            default: null,
            type: cc.AudioClip,
        },
        paylineHolderNode: cc.Node,
        paylineNormalSymbol: cc.Prefab,
        bonusSymbol: 'R',
        scatterSymbol: 'A',
        jackpotSymbol: 'JP',
        isSkipNearWinTurbo: false
    },

    onLoad() {
        const payLineMatrix = this.node.config.PAY_LINE_MATRIX;
        this.payLineMatrixForCompare = [];
        if (payLineMatrix) {
            Object.keys(payLineMatrix).forEach(key => {
                this.payLineMatrixForCompare.push(payLineMatrix[key].join().slice(0, -2));
            });
        }
    },
    start () {
        this.node.on("REEL_STOP_NEARWIN",this.reelStopNearWin,this);
        this.node.on("TABLE_START_NEARWIN",this.reelReset,this);
        this.node.on("REEL_ABOUT_TO_STOP_NEARWIN",this.adjustReelDelay,this);
        this.reelReset();
        this.startPositionX = this.reelParticle.x;
    },
    reelReset() {
        if (this.nearWinSoundKey) {
            this.node.soundPlayer.stopSound(this.nearWinSoundKey);
            this.nearWinSoundKey = null;
        }
        this.hideParticleList();
        this.clearSymbolPaylines();
    },
    adjustReelDelay({reels, data}) {
        let countScatter = 0;
        let countBonus = 0;
        let countJackpot = 0;
        let foundNearWin = false;
        let jackpotLine = '';
        this.nearWinList = [];
        let betLines = [];
        if (this.node.gSlotDataStore) {
            betLines = this.node.gSlotDataStore.betLines;
        }

        let isSkipWhenTurbo = this.isSkipNearWinTurbo && this.node.gSlotDataStore && this.node.gSlotDataStore.modeTurbo;
        for (let col = 0; col < data.length; col++) {
            const isNearWinScatter = (countScatter >= this.startAtScatterCount) && (countScatter < this.stopAtScatterCount) && !isSkipWhenTurbo;
            const isNearWinBonus = (countBonus >= this.startAtBonusCount) && (countBonus < this.stopAtBonusCount) && !isSkipWhenTurbo;
            let isNearWinJackpot = countJackpot >= this.startAtJackpotCount && !isSkipWhenTurbo;
            let isNearWin = (isNearWinScatter || isNearWinBonus);
            let jpIndex = -1;
            for (let row = 0; row < data[col].length; ++row) {
                const symbolValue = data[col][row];
                if (symbolValue === this.bonusSymbol) {
                    countBonus++;
                    this.createPaylineSymbol(this.node.reels[col], symbolValue, col, row);
                } else if (symbolValue === this.scatterSymbol) {
                    countScatter++;
                    this.createPaylineSymbol(this.node.reels[col], symbolValue, col, row);
                } else if (symbolValue === this.jackpotSymbol) {
                    countJackpot++;
                    jpIndex = row;
                    this.createPaylineSymbol(this.node.reels[col], symbolValue, col, row);
                }
            }

            if (col !== data.length - 1) {
                jackpotLine += (col > 0 ? ',' : '') + jpIndex;
            }

            if (!isSkipWhenTurbo && betLines && betLines.length) {
                let jpInBetLine = false;
                for (let i = 0; i < betLines.length; i++) {
                    if (!jpInBetLine) {
                        jpInBetLine = this.payLineMatrixForCompare[betLines[i] - 1] === jackpotLine;
                    }
                }
                isNearWinJackpot = col === data.length - 1 && countJackpot >= 4 && jpInBetLine;
            }

            isNearWin = isNearWin || isNearWinJackpot;
            foundNearWin = foundNearWin || isNearWin;

            if (foundNearWin) {
                this.nearWinList[col] = {isNearWinScatter, isNearWinBonus, isNearWinJackpot, isNearWin};
                reels[col].extendTimeToStop(isNearWin);
            }
        }
    },
    reelStopNearWin({count, context}) {
        this.hideParticleList();
        if (!context.isFastToResult) {
            this.runAnimationNearWin(this.scatterSymbol, count);
            this.runAnimationNearWin(this.bonusSymbol, count);
        }

        if (this.nearWinList[count] && this.nearWinList[count].isNearWin && !context.isFastToResult) {

            if (this.node.soundPlayer && !this.nearWinSoundKey) {
                this.nearWinSoundKey = this.node.soundPlayer.playSound(this.sfxNearWin, true);
            }

            const pos = this.startPositionX + count * this.node.config.SYMBOL_WIDTH;
            this.activeParticleList(pos);

            for (let i = count; i < this.node.reels.length; i++) {
                if (this.nearWinList[i] && this.nearWinList[i].isNearWin)
                    this.node.reels[i].adjustReelSpeed(this.node.config.SUPER_TURBO);
            }

            if (count === (this.node.reels.length - 1)) {
                cc.director.getScheduler().schedule(function(){
                    this.node.reels[count].adjustReelSpeed(this.node.curentConfig.TIME);
                }, this, 0, 0, 1, false);
            }

            if (this.nearWinList[count].isNearWinScatter) {
                this.runAnimationNearWin(this.scatterSymbol, count);
            }

            if (this.nearWinList[count].isNearWinBonus) {
                this.runAnimationNearWin(this.bonusSymbol, count);
            }

            if (this.nearWinList[count].isNearWinJackpot) {
                this.runAnimationNearWin(this.jackpotSymbol, count);
            }

        } else {
            if (this.nearWinSoundKey) {
                this.node.soundPlayer.stopSound(this.nearWinSoundKey);
                this.nearWinSoundKey = null;
            }
        }
        if (count >= this.node.reels.length) {
            this.clearSymbolPaylines();
            this.hideParticleList();
        }
    },
    hideParticleList() {
        this.reelParticle.active = false;
    },
    activeParticleList(pos) {
        this.reelParticle.active = true;
        this.reelParticle.x = pos;
    },

    clearSymbolPaylines() {
        if (!this.paylineNormalSymbol || !this.paylineHolderNode) return;
        this.paylineHolderNode.children.forEach(paylineSymbol => {
            if (paylineSymbol) {
                const {col, row, symbol} = paylineSymbol;
                this.node.emit('SHOW_STATIC_SYMBOL', col, row, symbol, true);
            }
        });
        this.paylineHolderNode.opacity = 0;
        this.paylineHolderNode.removeAllChildren();
    },

    runAnimationNearWin(symbolName, currentIndex){
        if (!this.paylineNormalSymbol || !this.paylineHolderNode || !symbolName) return;

        this.paylineHolderNode.opacity = 255;
        this.paylineHolderNode.children.forEach(paylineSymbol => {
            if (paylineSymbol.symbol === symbolName && paylineSymbol.col < currentIndex && !paylineSymbol.isShowing) {
                paylineSymbol.opacity = 255;
                paylineSymbol.isShowing = true;
                paylineSymbol.enableHighlight();
                paylineSymbol.playAnimation(1, true);
            }
            if (paylineSymbol.symbol === symbolName) {
                const {col, row, symbol} = paylineSymbol;
                this.node.emit('SHOW_STATIC_SYMBOL', col, row, symbol, false);
            }
        });
    },

    getXPosition(index) {
        let startX = -(this.node.config.TABLE_FORMAT.length / 2 - 0.5) * this.node.config.SYMBOL_WIDTH;
        return (startX + this.node.config.SYMBOL_WIDTH * index);
    },

    createPaylineSymbol(reel, symbol, col, row) {
        if (!this.paylineNormalSymbol || !this.paylineHolderNode) return;

        let paylineSymbol = cc.instantiate(this.paylineNormalSymbol);
        paylineSymbol.parent = this.paylineHolderNode;
        paylineSymbol.x = this.getXPosition(col);
        paylineSymbol.y = ((reel.showNumber/2 - row - 0.5)) * this.node.config.SYMBOL_HEIGHT;
        paylineSymbol.col = col;
        paylineSymbol.row = row;
        paylineSymbol.isShowing = false;
        paylineSymbol.symbol = symbol;
        paylineSymbol.changeToSymbol(symbol);
        paylineSymbol.disableHighlight();
    },
});
