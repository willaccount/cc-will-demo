cc.Class({
    extends: require('SlotReelv2'),

    init(showNumber, gameConfig, col, symbolPrefab, isFreeMode = false) {
        this._super(showNumber, gameConfig, col, symbolPrefab, isFreeMode);

        this.subSymbolList = [];
    },

    setStepToStop() {
        let bufferStepFreeGame = 0;
        if ((this.col == 0 || this.col == 4) && this.isFreeMode) {
            bufferStepFreeGame = 1;
        }
        this.step = (this.curentConfig.STEP_STOP * 2) - (this.totalNumber + bufferStepFreeGame);
    },

    stopSpinningWithDelay(delay, matrix = [], subSymbolsMatrix = [], callback) {
        this.delayIndex = delay;
        this.showSymbols = [];
        this.matrix = matrix;
        this.subSymbolsMatrix = subSymbolsMatrix;
        this.callbackStopReel = callback ? callback : () => { };
        let reelDelayStop = delay * this.curentConfig.REEL_DELAY_STOP;
        this.isNearWin = false;

        this.delay = delay;
        cc.director.getScheduler().schedule(this.setStepToStop, this, 0, 0, reelDelayStop, false);

        this.matrix.unshift(this.getRandomSymbolNameWithException('A'));
        if (this.config.TABLE_SYMBOL_BUFFER.BOT > 0)
            this.matrix.push(this.getRandomSymbolNameWithException('A'));

        this.subSymbolsMatrix.unshift(this.getRandomSymbolNameWithException('A'));
        if (this.config.TABLE_SYMBOL_BUFFER.BOT > 0)
            this.subSymbolsMatrix.push(this.getRandomSymbolNameWithException('A'));
    },

    circularSymbols() {
        const lastSymbol = this.reel.children[this.index % (this.totalNumber)];
        lastSymbol.removeSubSymbol();
        if (!this.showResult) {
            lastSymbol.changeToBlurSymbol(this.getRandomSymbolName());
        } else if (this.stop < this.totalNumber) {
            let isRealSymbol = this.stop >= this.config.TABLE_SYMBOL_BUFFER.TOP && this.stop < this.showNumber + this.config.TABLE_SYMBOL_BUFFER.TOP;
            let symbolValue = this.matrix[this.stop];
            let subSymbolValue = this.subSymbolsMatrix[this.stop];
            this.step = this.totalNumber + this.showNumber - (this.stop + this.config.TABLE_SYMBOL_BUFFER.BOT);
            if (isRealSymbol) {
                lastSymbol.changeToSymbol(symbolValue);
                if (subSymbolValue == 1) {
                    lastSymbol.showSubSymbol("s1");
                } else if (subSymbolValue == 2) {
                    lastSymbol.showSubSymbol("s2");
                }
                this.usingMotionBlur && lastSymbol.stopBlur();
                this.showSymbols.unshift(lastSymbol);
            } else {
                lastSymbol.changeToBlurSymbol(symbolValue);
            }
            this.stop++;
        }
        lastSymbol.y = lastSymbol.y + this.config.SYMBOL_HEIGHT * (this.totalNumber);
        this.index++;
    },

    showSmallSubSymbols() {
        this.reel.children.forEach((child) => {
            child.showSmallSubSymbol();
        });
    },

    resetSubSymbol() {},

    showSubSymbolAnims(subSymbolSkin) {
        this.reel.children.forEach((child) => {
            child.showSubSymbolAnim(subSymbolSkin);
        });
    },
});