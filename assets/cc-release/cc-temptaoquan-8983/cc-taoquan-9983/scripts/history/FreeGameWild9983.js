cc.Class({
    extends: cc.Component,

    properties: {
        symbols: {
            default: [],
            type: cc.SpriteFrame,
        }, 
    },

    onLoad () {
        this.node.changeToSymbol = this.changeToSymbol.bind(this);
    },

    changeToSymbol(symbolName) {
        this.node.active = false;
        if (this.symbols[symbolName - 1]) {
            this.node.active = true;
            this.node.getComponent(cc.Sprite).spriteFrame = this.symbols[symbolName - 1];
        }
    },
});
