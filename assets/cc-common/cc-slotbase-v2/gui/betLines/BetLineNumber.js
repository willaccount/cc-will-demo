cc.Class({
    extends: cc.Component,

    properties: {
        background: cc.Node,
        label: cc.Label,
    },

    setActiveBackground(isActive) {
        this.background.active = isActive;
    },

    setText(text = '') {
        this.label.string = text;
    },

});
