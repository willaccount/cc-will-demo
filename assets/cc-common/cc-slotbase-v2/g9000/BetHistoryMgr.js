const { updateUtilConfig } = require('utils');

cc.Class({
    extends: cc.Component,

    properties: {
        betHistoryPrefab: cc.Prefab
    },

    onLoad() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        this.playSession = urlParams.get('psId');
        this.token = urlParams.get('token');
        this.tokenType = urlParams.get('tokenType');
        this.userId = urlParams.get('userId');
        this.currencyCode = urlParams.get('c');

        if (this.currencyCode) {
            this._updateCurrencyConfig();
        }
        if (this.betHistoryPrefab && this.playSession) {
            this.betInstance = cc.instantiate(this.betHistoryPrefab);
            this.betInstance.parent = this.node;
            this.betInstance.opacity = 255;
            this.betInstance.setPosition(0,0);
            
            let clickAndShowComp = this.betInstance.getComponent('ClickAndShow');
            clickAndShowComp && clickAndShowComp.enter();

            this.betHistory = this.betInstance.getComponent('BetHistory');
            this.betHistory.setToken(this.token, this.tokenType, this.userId);
            this.betHistory.showBetDetail({sessionId: this.playSession});
            this.betHistory.disableCloseDetail();
        } else {
            console.warn(`Cant get history prefab for game ${this.gameId}`);
        }
    },

    _updateCurrencyConfig() {
        if (!this.node.gSlotDataStore || !this.node.config || !this.node.config.CURRENCY_CONFIG || !this.node.config.IS_SUPPORT_MULTI_CURRENCY) return;
        this.node.gSlotDataStore.currencyCode = this.currencyCode;
        const currencyConfig = this.node.config.CURRENCY_CONFIG[this.currencyCode];
        if (currencyConfig && updateUtilConfig) {
            updateUtilConfig('CURRENCY_CONFIG', currencyConfig.MONEY_FORMAT);
        }
    },
});
