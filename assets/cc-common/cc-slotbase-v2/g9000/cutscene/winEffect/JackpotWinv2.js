const {reverseEasing} = require('globalAnimationLibrary');
const {formatMoney} = require('utils');

cc.Class({
    extends: require('CutsceneMode'),

    properties: {
        winAmount: cc.Node,
        title: cc.Node,
        winInfo: cc.Node,
        coinsEffect: cc.Node,
        delayShowTime: 2,
        hideTime: 0.5,
        animDuration: 10,
        extendFinishDelayTime: 15,
    },

    onLoad() {
        this._super();
        this.label = this.winAmount.getComponentInChildren(cc.Label);
    },

    enter() {
        this.playSoundStart();
        const scaleTime = 0.2;
        this.winAmount.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(scaleTime, 1.2),
            cc.scaleTo(scaleTime, 1),
        )));
        if (this.title) {
            this.title.runAction(cc.repeatForever(cc.sequence(
                cc.scaleTo(0.5, 1.2),
                cc.scaleTo(0.5, 1),
            )));
        }
        this.initValue();
        this.startParticle();
        this.startUpdateWinAmount();
    },

    playSoundStart() {

    },

    playSoundEnd() {

    },

    initValue() {
        this.winInfo.scale = 1;
        this.currentValue = 0;
        this.currentTitle = 0;
        this.label.string = '';
        this.isUpdating = true;
        this.speedUp = false;
        this.bindQuickShow();
    },

    bindQuickShow() {
        this.skippable = false;
        this.node.runAction(cc.sequence(
            cc.delayTime(this.hideTime),
            cc.callFunc(() => {
                this.skippable = true;
            }),
        ));
    },

    startParticle() {
        this.coinsEffect.emit('START_PARTICLE');
        this.coinsEffect.emit('DROP_MONEY');
    },

    startUpdateWinAmount() {
        const speedUpEasing = t => t*t; // constant accelerated
        const slowDownEasing = reverseEasing(t => t*t);
        const halfAmount = 0.5 * this.content.winAmount;
        const extendFinishDelayTime = this.node.gSlotDataStore && this.node.gSlotDataStore.isAutoSpin ? this.extendFinishDelayTime : 0;
        this.currentTween = cc.tween(this);
        this.currentTween
            .to(0.5*this.animDuration, {currentValue: halfAmount}, {easing: speedUpEasing})
            .to(0.5*this.animDuration, {currentValue: this.content.winAmount}, {easing: slowDownEasing})
            .delay(extendFinishDelayTime)
            .call(() => {
                if (this.node.gSlotDataStore && this.node.gSlotDataStore.isAutoSpin) {
                    this.playSoundEnd();
                    this.skippable = false;
                    this.currentTween = null;
                    this.finish();
                }
            });
        this.currentTween.start();
    },

    update() {
        if (!this.isUpdating) return;
        this.label.string = formatMoney(this.currentValue);
    },

    onClick() {
        if (!this.isUpdating || this.speedUp) return;
        if (!this.skippable) return;

        this.speedUp = true;
        this.winAmount.stopAllActions();
        const scaleTime = 0.13;
        this.winAmount.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(scaleTime, 1.2),
            cc.scaleTo(scaleTime, 1),
        )));

        this.playSoundEnd();

        if (this.currentTween) {
            this.currentTween.stop();
            this.currentTween = null;
        }
        cc.tween(this)
            .to(1, {currentValue: this.content.winAmount})
            .call(() => {
                this.finish();
            })
            .start();
    },

    stopParticle() {
        this.coinsEffect.emit('STOP_PARTICLE');
    },

    finish() {
        this.isUpdating = false;
        this.label.string = formatMoney(this.content.winAmount);
        this.winAmount.stopAllActions();
        this.stopParticle();
        this.winInfo.runAction(cc.sequence(
            cc.delayTime(this.delayShowTime),
            cc.scaleTo(this.hideTime, 0),
            cc.callFunc(()=>{
                //this.node.soundPlayer.playBackgroundMusic();
                this.label.string = '';
                this.exit(); // exit cutscene
            })
        ));
    },

    onDisable() {
        if (this.currentTween) {
            this.currentTween.stop();
            this.currentTween = null;
        }
    }
});
