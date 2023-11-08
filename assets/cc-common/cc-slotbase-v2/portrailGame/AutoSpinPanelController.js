cc.Class({
    extends: cc.Component,

    properties: {
        autoSpinButton: cc.Node,
        normalFrame: cc.SpriteFrame,
        selectedFrame: cc.SpriteFrame,
        numberButtons: [cc.Node],
        overlay : cc.Node
    },

    onLoad() {
        this.node.showOverlay = this.showOverlay.bind(this);
    },

    showOverlay(isShow = false) {
        this.overlay.active = isShow;
    },

    getSpinNumber(evt, number) {
        if(!evt || !number) {
            cc.warn('Missing event or number of spins');
            return;
        }
        this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
        this.spinNumber = number;
        this.numberButtons.forEach(it => {
            it.getComponent(cc.Sprite).spriteFrame = this.normalFrame;
            it.getChildByName('Label').color = new cc.Color().fromHEX('#ffffff');
        });
        evt.target.getComponent(cc.Sprite).spriteFrame = this.selectedFrame;
        evt.target.getChildByName('Label').color = new cc.Color().fromHEX('#f3d598');
        this.autoSpinButton.getComponent(cc.Button).interactable = true;
    },

    startAutoSpinning() {
        this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
        this.setAutoSpinEvent = new cc.Event.EventCustom('SET_AUTO_SPIN_EVENT', true);
        this.setAutoSpinEvent.setUserData({
            spinNumber: this.spinNumber,
        });
        this.node.dispatchEvent(this.setAutoSpinEvent);
        this.node.emit('HIDE', 0, ()=>{ this.node.opacity = 0;});
        this.resetButtonStatus();
        this.overlay.active = false;
    },

    resetButtonStatus() {
        this.autoSpinButton.getComponent(cc.Button).interactable = false;
        this.numberButtons.forEach(it => {
            it.getComponent(cc.Sprite).spriteFrame = this.normalFrame;
            it.getChildByName('Label').color = new cc.Color().fromHEX('#ffffff');
        });
    },

    clickBtnClose() {
        this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
        this.resetButtonStatus();
        this.node.emit('HIDE', 0, ()=>{ this.node.opacity = 0;});
        this.overlay.active = false;
    }
});
