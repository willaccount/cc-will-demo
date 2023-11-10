const WIN_ANIM = {
    0: 'thanglon',
    1: 'thangcuclon',
    2: 'thangsieulon'
};
const {formatMoney} = require('utils');
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
        this.phaoHoaLeft.active = false;
        this.phaoHoaRight.active = false;
        this.fireWork.active = false;
    },

    changeTitle(index) {
        this.currentTitle = index;
        if(this.bigWinAnim) {
            this.bigWinAnim.getComponent(sp.Skeleton).setSkin(WIN_ANIM[index]);
            this.bigWinAnim.getComponent(sp.Skeleton).setSlotsToSetupPose();
            this.bigWinAnim.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
        }
    },
});