

cc.Class({
    extends: cc.Component,

    properties: {
        overlayLayer: cc.Node,
        lbMessage: cc.Label,
        btnOK: cc.Button,
        btnCancel: cc.Button,
    },
    actionOK: null,
    actionCancel: null,

    onLoad () {
        this.btnCancel.node.on('click',() => {
            this.closeMessage();            
            if(this.actionCancel) this.actionCancel();
        });
        this.btnOK.node.on('click',() => {
            this.closeMessage();
            if (this.actionOK) this.actionOK();
        });
    },

    showMessage({strText, actionCancel = null, actionOK = null}){
        if (!this.node) return;
        this.node.active = true;
        this.lbMessage.string = strText;
        this.actionCancel = actionCancel;
        this.actionOK = actionOK;
        this.btnCancel.node.active = false;
        if (actionCancel !== null) {
            this.btnCancel.node.active = true;
        }
        else
        {
            this.btnCancel.node.active = false;
        }
        if (actionOK !== null)
        {
            this.btnOK.node.active = true;
        }
        else
        {
            this.btnOK.node.active = false;
        }
    },

    showNotifyMessage({strText}){
        if (!this.node) return;
        
        this.node.active = true;
        this.lbMessage.string = strText;
        this.btnOK.node.active = false;
        this.btnCancel.node.active = false;
    },

    closeMessage() {
        this.node.active = false;
    },

    setBtnOkText(text) {
        this.btnOK.node.getChildByName('Text').getComponent(cc.Label).string = text;
    },

    setBtnCancel(text) {
        this.btnCancel.node.getChildByName('Text').getComponent(cc.Label).string = text;
    }

});
