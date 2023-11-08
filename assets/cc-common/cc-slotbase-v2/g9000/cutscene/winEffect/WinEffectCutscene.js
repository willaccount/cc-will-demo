cc.Class({
    extends: cc.Component,
    properties: {
        megaWinRate: 30,
        superWinRate: 50,
    },
    onLoad() {
        this.milisecondRate = 1000;
        this.isSuperWinShow = false;
        this.isBigWinShow = false;
        this.isMegaWinShow = false;
        this.duration = 9000;
        this.node.opacity = 0;
        this.node.active = false;
        this.gSlotWinEffect = this.node.gSlotWinEffect;
        this.winAmount = this.node.getChildByName("WinAmount");
        this.soundPlayer = (this.node.soundPlayer) ? this.node.soundPlayer : this.node;
        this.node.on("PLAY",this.show,this);
    },

    show(data, callback) {
        if(this.node == null || this.node == 'undefined'|| this.node._children == null|| this.node._children == 'undefined'){
            return;
        }
        this.soundPlayer.node.emit("STOP_ALL_AUDIO");
        this.isShow = true;
        this.callback = callback;
        this.value = data.winAmount;
        this.currentBetData = data.currentBetData;
        this.node.active = true;
        this.node.opacity = 255;

        const gSlotWinEffect = this.node.gSlotWinEffect;
        gSlotWinEffect.init(0, this.spriteData);

        this.calbackWin = {
            currentBetData: this.currentBetData,
            enterFrame: (per, finalWin) => {
                this.enterFrame(gSlotWinEffect, per, finalWin);
            },
            runMegaWin: () => {
                this.runMegaWin(gSlotWinEffect);
            },
            runSuperWin: () => {
                this.runSuperWin(gSlotWinEffect);
            },
            runFinishBigWin: () => {
                this.runFinishBigWin();
            },
            runFinishWin: () => {
                this.runFinishWin(gSlotWinEffect);
            }
        };

        setTimeout(() => {
            if (this.isShow) {
                this.node.on('click', () => {
                    this.quickShow(gSlotWinEffect);
                });
            }
        }, 500);

        this.showWinAnimation();
    },

    showWinAnimation() {
        if(this.node == null || this.node == 'undefined'|| this.node._children == null|| this.node._children == 'undefined'){
            return;
        }
        this.soundPlayer.node.emit("PLAY_WIN_START");
        this.timeOutSoundLoop = setTimeout(() => {
            this.soundPlayer.node.emit("PLAY_WIN_LOOP");
        }, 1000);

        this.node.runAction(cc.sequence(
            cc.delayTime(.2),
            cc.callFunc(() => {
                this.winAmount.onUpdateWinValue(this.value, this.duration, this.calbackWin, false, 1000, 50, this.superWinRate, this.megaWinRate);
            }),
        ));
    },

    quickShow(gSlotWinEffect) {
        if(this.node == null || this.node == 'undefined'|| this.node._children == null|| this.node._children == 'undefined'){
            return;
        }
        if (!this.isShow) {
            return;
        }
        if (this.timeOutSoundLoop) {
            clearTimeout(this.timeOutSoundLoop);
        }
        this.isShow = false;
        this.calbackWin = {
            enterFrame: (per, finalWin) => {
                this.enterFrame(gSlotWinEffect, per, finalWin);
            },
            runFinishWin: () => {
                this.runFinishWin(gSlotWinEffect);
            }
        };
        const start = Number(this.winAmount.string);
        const range = this.value - start;
        let animationDuration = 1000;
        this.node.stopAllActions();
        this.node.runAction(cc.sequence(
            cc.callFunc(() => {
                if (range / this.currentBetData * this.milisecondRate < animationDuration) {
                    animationDuration = range;
                }
                this.soundPlayer.node.emit("STOP_WIN_LOOP");
                this.soundPlayer.node.emit("PLAY_WIN_END");
                this.winAmount.onUpdateWinValue(this.value, animationDuration, this.calbackWin, true);
            }),
            cc.callFunc(() => {
                if (this.value >= this.currentBetData * this.superWinRate) {
                    this.runSuperWin(gSlotWinEffect);
                } else if (this.value >= this.currentBetData * this.megaWinRate) {
                    this.runMegaWin(gSlotWinEffect);
                } else {
                    this.runFinishBigWin();
                }
            }),
        ));
    },



    enterFrame(gSlotWinEffect, per, finalWin) {
        gSlotWinEffect.enterFrame(per, finalWin);
    },

    runMegaWin(gSlotWinEffect) {
        if(this.node == null || this.node == 'undefined'|| this.node._children == null|| this.node._children == 'undefined'){
            return;
        }
        if (this.isMegaWinShow) {
            return;
        }
        this.isMegaWinShow = true;
        gSlotWinEffect.setWinEff(1);
    },

    runSuperWin(gSlotWinEffect) {
        if(this.node == null || this.node == 'undefined'|| this.node._children == null|| this.node._children == 'undefined'){
            return;
        }
        if (this.isSuperWinShow) {
            return;
        }
        this.isSuperWinShow = true;
        gSlotWinEffect.setWinEff(2);
    },

    runFinishBigWin() {
        if(this.node == null || this.node == 'undefined'|| this.node._children == null|| this.node._children == 'undefined'){
            return;
        }
        if (this.isBigWinShow) {
            return;
        }
        this.isBigWinShow = true;
    },

    runFinishWin(gSlotWinEffect) {
        if(this.node == null || this.node == 'undefined'|| this.node._children == null|| this.node._children == 'undefined'){
            return;
        }
        if (this.isShow) {
            this.soundPlayer.node.emit("STOP_WIN_LOOP");
            this.soundPlayer.node.emit("PLAY_WIN_END");
        }
        this.isSuperWinShow = false;
        this.isMegaWinShow = false;
        this.isBigWinShow = false;
        this.node.off('click');
        gSlotWinEffect.hideFn(() => {
            if (this.node.gSlotDataStore) this.soundPlayer.node.emit("PLAY_SOUND_BACKGROUND",this.node.gSlotDataStore.currentGameMode);
            this.winAmount.resetValue();
            if (this.callback && typeof this.callback == "function") {
                this.callback();
            }
        });
    },
});
