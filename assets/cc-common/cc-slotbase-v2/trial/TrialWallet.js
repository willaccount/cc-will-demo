const { formatWalletMoney, formatMoney, floatUtils } = require("utils");
cc.Class({
    extends: cc.Component,
    properties: {
        isFormatWallet: true,
        _walletValue: 0,
        walletValue: {
            get: function () {
                return this._walletValue;
            },
            set: function (value) {
                this._walletValue = value;
                if (this.getComponent(cc.Label)) {
                    this.getComponent(cc.Label).string = this.isFormatWallet ? formatWalletMoney(Number(this._walletValue)) : formatMoney(Number(this._walletValue));
                }
            },
            visible: false
        },
        timeTweenWallet: 0.3
    },
    onLoad() {
        this.isInit = false;
        this.node.controller = this;
    },
    setDefaultValue(defaultWallet,defaultBet){
        this.defaultWallet = window._trialWallet || defaultWallet;
        this.defaultBet = defaultBet;
    },
    resetTrialValue() {
        this.walletValue = this.defaultWallet;
        this.lastValue = Number(this.walletValue);
        if (this.node.gSlotDataStore) {
            this.node.gSlotDataStore.trialWallet = this.lastValue;
        }
    },
    hide(){
        this.node.active = false;
    },
    _tweenCoin(coinValue) {
        this.tweenCoin && this.tweenCoin.stop();
        this.tweenCoin = cc.tween(this).to(this.timeTweenWallet, {walletValue: coinValue});
        this.tweenCoin.start();
        cc.log("%c TrialMoney Update: ","color: red;", formatMoney(coinValue));
    },
    updateBet(betId) {
        this.defaultBet = betId;
    },
    updateWalletOnTrialSpinClick() {
        this.lastValue = floatUtils.minus(this.lastValue, this.defaultBet);

        if (this.node.gSlotDataStore) {
            this.node.gSlotDataStore.trialWallet = this.lastValue;
        }
        cc.log("%cTrial Wallet change on Spin: - ", "color:red;", + this.defaultBet,"=", this.lastValue);
        this._tweenCoin(this.lastValue);
    },
    updateTrialWallet(winAmount) {
        let isUpdateWinAmount = this.node.gSlotDataStore ? this.node.gSlotDataStore.isUpdateWinAmount : false;
        winAmount = winAmount || 0;
        this.lastValue = floatUtils.plus(this.lastValue, winAmount);
        if (this.node.gSlotDataStore) {
            this.node.gSlotDataStore.trialWallet = this.lastValue;
        }
        cc.log("%cTrial Wallet change: + ", "color:red;", winAmount, "=", this.lastValue);
        if (!isUpdateWinAmount) {
            this._tweenCoin(this.lastValue);
        }
    },
    onDisable() {
        if(this.tweenCoin){
            this.tweenCoin.stop();
        }
    }
});
