const i18n = require('LanguageData');
cc.Class({
    extends: cc.Component,

    properties: {
        dataID: '',
    },

    onLoad() {
        this.label = this.node.getComponent(cc.Label);
        this.updateLabel();
    },
    
    updateLabel() {
        if (!this.dataID) return;
        let localizedString = i18n.getLocalizedString(this.dataID);
        if (localizedString) {
            this.label.string = localizedString;
        }
    }
});
