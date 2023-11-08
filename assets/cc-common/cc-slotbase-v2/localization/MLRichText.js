cc.Class({
    extends: cc.Component,

    properties: {
        textAsset: {
            type: cc.Asset,
            default: null
        },
        isAutoChange: true,
    },

    onLoad() {
        this.updateDefaultLanguage();
    },

    updateDefaultLanguage() {
        if (!this.node.config) {
            let config = this.node.addComponent("GetGameConfig");
            this.updateLanguage();
        } else {
            this.updateLanguage();
        }
    },

    updateLanguage() {
        if (!this.isAutoChange) return;
        this.richTextComp = this.node.getComponent(cc.RichText);
        if (this.richTextComp) {
            this.richTextComp.string = this.textAsset.text;
        }
    },
});
