

cc.Class({
    extends: cc.Component,
    properties: {
        label: cc.Node,
    },
    onLoad () {
        this.node.on("UPDATE_ANIMATE_STYLE",this.updateValue,this);
        this.node.on("UPDATE_WALLET_STYLE",this.updateWallet,this);
        this.node.on("UPDATE_STRING",this.updateString,this);
        this.node.on("RESET_NUMBER",this.resetNumber, this);
    },
    resetNumber() {
        this.label.resetValue();
    },
    updateString({value = ""}) {
        this.label.getComponent(cc.Label).string = value;
    },
    updateValue({value = "", time = 300}) {
        this.label.onUpdateValue(value, time);
    },
    updateWallet({value = "", time = 300}) {
        this.label.onUpdateWallet(value, time);
    }
});
