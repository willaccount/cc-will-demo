
cc.Class({
    extends: require('SlotSymbol'),

    properties: {
        subSymbol: cc.Node,
    },

    onLoad() {
        this._super();

        this.registerMessages();
        this.registerFunctionCall();
        this.staticSymbolSprite = this.staticSymbol.getComponent(cc.Sprite);
    },

    registerMessages() {
        this.node.on("SHOW_SUB_SYMBOL", this.showSubSymbol, this);
        this.node.on("REMOVE_SUB_SYMBOL", this.removeSubSymbol, this);
        this.node.on("SHOW_SMALL_SUB_SYMBOL", this.showSmallSubSymbol, this);
        this.node.on("RESET_SUB_SYMBOL", this.reset, this);
    },

    registerFunctionCall() {
        this.node.showSubSymbol = this.showSubSymbol.bind(this);
        this.node.removeSubSymbol = this.removeSubSymbol.bind(this);
        this.node.showSmallSubSymbol = this.showSmallSubSymbol.bind(this);
        this.node.reset = this.reset.bind(this);
    },

    showSubSymbol(symbolName) {
        if (this.isFakeSymbol) return;
        const asset = this.assets[symbolName];
        this.staticSymbol.opacity = 0;
        this.subSymbol.active = true;
        this.subSymbol.opacity = 255;
        this.subSymbol.getComponent(cc.Sprite).spriteFrame = asset;
    },

    showSmallSubSymbol() {
        if (this.isFakeSymbol) return;
        this.subSymbol.stopAllActions();
        this.subSymbolTween = cc.tween(this.subSymbol);
        this.subSymbolTween
            .to(0.1, { scale: 0.5 })
            .to(0.1, { position: cc.v2(40, 40) })
            .start();
    },

    removeSubSymbol() {
        this.subSymbol.scale = 1;
        this.subSymbol.setPosition(0, 0);
        this.subSymbol.active = false;
    },

    reset() {
        this.staticSymbol.stopAllActions();
        this.bigSymbol = false;
        this.subSymbol.active = false;
        this.node.opacity = 255;
        this.staticSymbol.opacity = 255;
        this.subSymbol.opacity = 255;
    },
});