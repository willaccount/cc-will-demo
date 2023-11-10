const WIN_ANIM = {
    0: 'thanglon',
    1: 'thangcuclon',
    2: 'thangsieulon'
};
const {formatMoney} = require('utils');
const {reverseEasing} = require('globalAnimationLibrary');
cc.Class({
    extends: require('WinEffectv2'),

    properties: {
        phaoHoaLeft: cc.Node,
        phaoHoaRight: cc.Node,
        fireWork: cc.Node,
        bigWinAnim: cc.Node,
    },

    onLoad() {
        this._super();
        this.phaoHoaLeft.active = false;
        this.phaoHoaRight.active = false;
        this.bigWinType = 0;
    },

    initValue() {
        this.winInfo.scale = 1;
        this.currentValue = 0;
        this.currentTitle = 0;
        this.label.string = '';
        this.title.active = false;
        this.megaWinAmount = this.content.currentBetData * this.megaRate;
        this.superWinAmount = this.content.currentBetData * this.superRate;
        this.isUpdating = true;
        this.speedUp = false;
        this.bindQuickShow();
    },

    show() {
        this._super();
        let data = this.content;
        this.winValue = data.winAmount;
    },

    update() {
        if (!this.isUpdating) return;
        this.label.string = formatMoney(this.currentValue);
        if (this.currentValue >= this.superWinAmount && this.currentTitle == 1) {
            this.changeTitle(2);
        } else if (this.currentValue >= this.megaWinAmount  && this.currentTitle == 0) {
            this.changeTitle(1);
        }
    },

    showEffectWin() {
        this.isShowNormalEffect = true;
        if(this.overlayNode){
            this.overlayNode.active = true;
        }
        this.winInfo.opacity = 255;
        if(this.bigWinAnim) {
            this.bigWinAnim.getComponent(sp.Skeleton).setSkin(WIN_ANIM[0]);
            this.bigWinAnim.getComponent(sp.Skeleton).setSlotsToSetupPose();
            this.bigWinAnim.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
        }
        this.playSoundStart();
        const scaleTime = 0.2;
        this.winAmount.stopAllActions();
        this.winAmount.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(scaleTime, 1.2),
            cc.scaleTo(scaleTime, 1),
        )));
        this.initValue();
        this.startParticle();
        this.startUpdateWinAmount();
    },

    enter() {
        this.node.stopAllActions();
        let modeTurbo = false;
        if (this.node.gSlotDataStore) modeTurbo = this.showEffectWin();
        this.node.fullDisplay = !modeTurbo;
    },

    startParticle() {
        this.phaoHoaLeft.active = true;
        this.phaoHoaRight.active = true;
        this.phaoHoaLeft.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
        this.phaoHoaRight.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
        this.fireWork.active = true;
    },

    stopParticle() {
        cc.tween(this.phaoHoaLeft)
        .to(1, {opacity: 0}, {easing: "sineInOut"})
        .call(() => {
            this.phaoHoaLeft.active = false;
        })
        .start();

        cc.tween(this.phaoHoaRight)
        .to(1, {opacity: 0}, {easing: "sineInOut"})
        .call(() => {
            this.phaoHoaRight.active = false;
        })
        .start();

        cc.tween(this.fireWork)
        .to(1, {opacity: 0}, {easing: "sineInOut"})
        .call(() => {
            this.fireWork.active = false;
        })
        .start();
    },

    changeTitle(index) {
        this.currentTitle = index;
        if(this.bigWinAnim) {
            this.bigWinAnim.getComponent(sp.Skeleton).setSkin(WIN_ANIM[index]);
            this.bigWinAnim.getComponent(sp.Skeleton).setSlotsToSetupPose();
            this.bigWinAnim.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
        }
    },

    startUpdateWinAmount() {
        this.currentTween = cc.tween(this);
        if (this.winValue >= this.superWinAmount) {
            this.currentTween
                .to(this.animDuration / 3, {currentValue: this.megaWinAmount}, {easing: "sineInOut"})
                .to(this.animDuration / 3, {currentValue: this.superWinAmount}, {easing: "sineInOut"})
                .to(this.animDuration / 3, {currentValue: this.winValue}, {easing: "sineInOut"})
                .call(() => {
                    this.skippable = false;
                    this.currentTween = null;
                    this.finish();
                });
        } else if (this.winValue >= this.megaWinAmount) {
            this.currentTween = cc.tween(this)
                .to(this.animDuration / 2, {currentValue: this.megaWinAmount}, {easing: "sineInOut"})
                .to(this.animDuration / 2, {currentValue: this.winValue}, {easing: "sineInOut"})
                .call(() => {
                    this.skippable = false;
                    this.currentTween = null;
                    this.finish();
                });
        } else {
            this.currentTween = cc.tween(this)
                .to(this.animDuration, {currentValue: this.winValue}, {easing: "sineInOut"})
                .call(() => {
                    this.skippable = false;
                    this.currentTween = null;
                    this.finish();
                });
        }
        this.currentTween.start();
    },

    finish() {
        this.isUpdating = false;
        this.label.string = formatMoney(this.content.winAmount);
        this.winAmount.stopAllActions();
        this.winInfo.stopAllActions();
        this.winInfo.runAction(cc.sequence(
            cc.delayTime(this.delayShowTime),
            cc.scaleTo(this.hideTime, 0),
            cc.callFunc(()=>{
                //this.node.soundPlayer.playBackgroundMusic();
                this.label.string = '';
                this.winInfo.opacity = 0;
                this.stopParticle();
                this.exit(); // exit cutscene
            })
        ));
    },

    onDisable() {
        this.node.stopAllActions();
    },
});