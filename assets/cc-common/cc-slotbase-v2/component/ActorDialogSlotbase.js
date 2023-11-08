

const cutsceneMode = require('CutsceneMode');

cc.Class({
    extends: cutsceneMode,

    properties: {
        overlayLayer: cc.Node,
        lbMessage: cc.Label,
        btnOK: cc.Button,
        btnCancel: cc.Button,
        buttonLayout: cc.Node,
    },
    actionOK: null,
    actionCancel: null,

    onLoad() {
        this.node.on("PLAY", this.play, this);
        this.node.on("HIDE", this.exit, this);
        this.node.opacity = 255;
        this.node.active = false;
    },

    start() {},

    show() {
        const { strText, actionBtnOK = null, actionCancel = null, } = this.content;
        this.node.active = true;
        this.overlayLayer.active = true;
        this.showMessage({ strText, actionBtnOK, actionCancel });
        this.btnOK.node.off('click');
        this.btnOK.node.on('click', () => {
            this.closeMessage();
            if (this.actionOK) this.actionOK();
            if (this.node.soundPlayer) {
                this.node.soundPlayer.playSFXClick();
            }
        });

        this.btnCancel.node.off('click');
        this.btnCancel.node.on('click', () => {
            this.closeMessage();
            if (this.actionCancel) this.actionCancel();
            if (this.node.soundPlayer) {
                this.node.soundPlayer.playSFXClick();
            }
        });
    },

    enter() {},

    showMessage({ strText, actionBtnOK = null, actionCancel = null }) {
        this.node.active = true;
        this.lbMessage.getComponent(cc.Label).string = strText;
        this.actionOK = actionBtnOK;
        this.actionCancel = actionCancel;
        this.btnOK.node.active = actionBtnOK != null;
        this.btnCancel.node.active = actionCancel != null;
        if (this.buttonLayout) {
            this.buttonLayout.active = this.btnOK.node.active || this.btnCancel.node.active;
        }
    },

    closeMessage() {
        this.hideNode();
        this.callback && this.callback();
    },

    setBtnOkText(text) {
        const labelOk = this.btnOK.node.getComponentInChildren(cc.Label);
        if (labelOk) labelOk.string = text;
    },

    setBtnCancel(text) {
        const labelCancel = this.btnCancel.node.getComponentInChildren(cc.Label);
        if (labelCancel) labelCancel.string = text;
    },

    hideNode() {
        this.overlayLayer.active = false;
        this.exit();
    }

});
