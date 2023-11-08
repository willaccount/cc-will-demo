cc.Class({
    extends: require('CutsceneMode'),

    properties: {
        winAmount: cc.Node,
        coinEffect: cc.Node,
        blockInputs: [cc.Node],
        bigWinDuration: 20,
        megaWinDuration: 36,
        superWinDuration: 72
    },

    onLoad() {
        this._super();
        this.delayTimeToSkip = 2;
        this.duration = 10;
        this.timeHide = 1;
        this.delaySkip = 0.5;
    },

    enter() {
        this.resetValue();
        this.toggleBlockInputs(true);
        this.isX100 = (this.content.winAmount / this.content.currentBetData) >= 100;
        const currentSlotDirector = this.node.mainDirector.currentGameMode.director;
        if (currentSlotDirector && currentSlotDirector.buttons) {
            currentSlotDirector.buttons.emit('ENABLE_SPIN_KEY', false);
        }
        this.isForceSkip = false;
        this.showEffectWin();
    },

    toggleBlockInputs(isOn = false) {
        this.blockInputs.forEach(item => {
            item.active = isOn;
        });
    },

    resetValue() {
        this.skippable = false;
        this.isSpeedUp = false;
    },

    showEffectWin() {
        const isFTR = this.node.gSlotDataStore.gameSpeed === this.node.config.GAME_SPEED.INSTANTLY;
        if (this.overlayNode) { this.overlayNode.active = true; }
        if (isFTR) {
            this._showFastBigWin();
        } else {
            const { winAmount, currentBetData } = this.content;
            this.duration = this.bigWinDuration;
            if (winAmount / currentBetData >= 50) {
                this.duration = this.megaWinDuration;
            } else if (winAmount / currentBetData >= 100) {
                this.duration = this.superWinDuration;
            }
            this.winAmount.emit("UPDATE_WIN_AMOUNT", { value: winAmount, time: this.duration * 1000 });
            this.coinEffect.emit("PLAY_COIN_EFFECT");
            this.playSoundStart();
            // bind quick show
            this._actionBindQuickShow = cc.sequence(
                cc.callFunc(() => {
                    this.skippable = true;
                }),
                cc.delayTime(this.duration),
                cc.callFunc(() => {
                    this.finish();
                    this.skippable = false;
                })
            );
            this.node.runAction(this._actionBindQuickShow);
        }
        const { isAutoSpin } = this.node.gSlotDataStore;
        const { isFinished } = this.node.gSlotDataStore.playSession;
        if (!isAutoSpin && isFinished) {
            this.callback && this.callback();
            this.callback = null;
        }
    },
    _showFastBigWin() {
        const { winAmount } = this.content;
        this.duration = 0.02;
        this.winAmount.emit("PLAY_COIN_PARTICLE");
        this.winAmount.emit("UPDATE_WIN_AMOUNT", { value: winAmount, time: this.duration * 1000 });
        this.exit();
    },

    playSoundStart() { },

    playSoundEnd() { },

    onClick() {
        if (!this.skippable) return;
        if (this.isSpeedUp) return;
        this.skippable = false;
        cc.log("SKIP BIG WIN");
        this.isSpeedUp = true;
        const { winAmount } = this.content;
        this.winAmount.emit("FAST_UPDATE_WIN_AMOUNT", { value: winAmount, time: 0 });
        this.finish();
    },
    finish() {
        this.coinEffect.emit("STOP_COIN_EFFECT");
        this.playSoundEnd();
        this.toggleBlockInputs();
        this.node.stopAllActions();
        if (this.isForceSkip) {
            if (this.node.soundPlayer) {
                this.node.soundPlayer.stopAllAudio();
                this.node.soundPlayer.playMainBGM();
            }
            this.exit();
        } else {
            this.node.runAction(cc.sequence(
                cc.fadeOut(this.timeHide),
                cc.callFunc(() => {
                    if (this.node.soundPlayer) {
                        this.node.soundPlayer.stopAllAudio();
                        this.node.soundPlayer.playMainBGM();
                    }
                    this.exit();
                })
            ));
        }
    },

    skip() {
        this.isForceSkip = true;
        this.onClick();
    },

    exit() {
        this.callback && this.callback();
        this.callback = null;
        const currentSlotDirector = this.node.mainDirector.currentGameMode.director;
        if (currentSlotDirector && currentSlotDirector.buttons && !this.node.mainDirector.isTutorialShowing()) {
            currentSlotDirector.buttons.emit('ENABLE_SPIN_KEY', true);
        }

        if (this.node.mainDirector) {
            this.node.mainDirector.onIngameEvent("ON_FINISH_BIG_WIN", this.node.name);
        }
        this.node.active = false;
        this.isForceSkip = false;
    },
});