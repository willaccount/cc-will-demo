cc.Class({
    extends: cc.Component,
    properties: {
        isFormatWallet: true
    },
    onLoad() {
        this.node.walletController = this;
        this.isShowMoney = false;
        this.node.on("UPDATE_WALLET", this.callbackUpdateWallet, this);
        this.node.callbackUpdateWallet = this.callbackUpdateWallet.bind(this);
    },
    callbackUpdateWallet(data) {
        const {amount} = data;
        this.node.gSlotDataStore.slotBetDataStore.updateWallet(amount);
        if (!this.isShowMoney) {
            this.isShowMoney = true;
            this.updateMoneyWallet();
        }
    },
    updateMoneyWallet() {
        const {wallet} = this.node.gSlotDataStore.slotBetDataStore.data;
        if(this.isFormatWallet){
            this.node.emit("UPDATE_WALLET_STYLE", {value: wallet});
        }else{
            this.node.emit("UPDATE_ANIMATE_STYLE", {value: wallet});
        }
    }
});
