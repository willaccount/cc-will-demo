cc.Class({
    extends: cc.Component,

    properties: {
        textId: "",
    },

    onLoad() {
        this.updateDefaultLanguage();
    },

    updateDefaultLanguage() {
        if (!this.node.config) {
            this.node.addComponent("GetGameConfig");
            this.updateLanguage();
        } else {
            this.updateLanguage();
        }
    },

    updateLanguage() {
        this.labelComp = this.node.getComponent(cc.Label);

        this.messageDialog = this.node.config['MESSAGE_DIALOG'];
        this.gameText = this.node.config['GAME_TEXT'];

        let content = this.messageDialog[this.textId] || this.gameText[this.textId] || "";
        if (content != "" && this.labelComp) this.labelComp.string = content;
    },
});
