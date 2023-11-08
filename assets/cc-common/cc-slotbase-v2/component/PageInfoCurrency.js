cc.Class({
    extends: cc.Component,

    properties: {
        infoNodes: [cc.Node],
        infoConfigs: {
            default: [],
            type: require('SlotCustomDataType').InfoCurrencyConfig
        },
    },

    start() {
        let { config, mainDirector } = this.node;
        if (!config || !config.IS_SUPPORT_MULTI_CURRENCY || !mainDirector) return;
        const currencyCode = mainDirector.director.getClientCurrency() || '';
        const infoConfig = this.infoConfigs.find(config => config.currencyCode.toUpperCase() == currencyCode.toUpperCase()) || {};
        infoConfig && this.setupInfoPages(infoConfig.infos);
    },

    setupInfoPages(infoData) {
        if (!infoData ||!infoData.length) return;
        for (let i = 0; i < infoData.length; i++) {
            this.infoNodes[i].getComponent(cc.Sprite).spriteFrame = infoData[i];
        }
    }
});
