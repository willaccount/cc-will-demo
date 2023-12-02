
let listSubAnim = {
    's1': 'Tai',
    's2': 'Loc',
};
cc.Class({
    extends: require('SlotSymbol'),

    properties: {
        subSymbol: cc.Node,
        subSymbolAnim: sp.Skeleton
    },

    onLoad() {
        this._super();

        this.registerMessages();
        this.registerFunctionCall();
        this.staticSymbolSprite = this.staticSymbol.getComponent(cc.Sprite);
        // this.subSymbolAnim.node.active = false;
    },

    registerMessages() {
        this.node.on("SHOW_SUB_SYMBOL", this.showSubSymbol, this);
        this.node.on("REMOVE_SUB_SYMBOL", this.removeSubSymbol, this);
        this.node.on("SHOW_SMALL_SUB_SYMBOL", this.showSmallSubSymbol, this);
        this.node.on("SHOW_SMALLI_SUB_SYMBOL_FAST", this.showSmallSubSymbolFast, this);
        this.node.on("RESET_SUB_SYMBOL", this.reset, this);
        this.node.on("SHOW_SUB_SYMBOL_ANIM", this.showSubSymbolAnim, this);
    },

    registerFunctionCall() {
        this.node.showSubSymbol = this.showSubSymbol.bind(this);
        this.node.removeSubSymbol = this.removeSubSymbol.bind(this);
        this.node.showSmallSubSymbol = this.showSmallSubSymbol.bind(this);
        this.node.showSmallSubSymbolFast = this.showSmallSubSymbolFast.bind(this);
        this.node.reset = this.reset.bind(this);
        this.node.showSubSymbolAnim = this.showSubSymbolAnim.bind(this);
    },

    showSubSymbol(symbolName) {
        if (this.isFakeSymbol) return;
        const asset = this.assets[symbolName];
        this.staticSymbol.opacity = 0;
        this.subSymbol.active = true;
        this.subSymbol.opacity = 255;
        this.subSymbolAnim.node.active = false;
        this.subSymbolAnim.node.opacity = 255;
        this.subSymbol.getComponent(cc.Sprite).spriteFrame = asset;
    },

    showSmallSubSymbol() {
        if (this.isFakeSymbol) return;
        this.subSymbolAnim.node.active = false;
        this.subSymbolAnim.node.opacity = 255;
        this.subSymbol.stopAllActions();
        this.subSymbolTween = cc.tween(this.subSymbol);
        this.subSymbolTween
            .to(0.1, { scale: 0.5 })
            .to(0.1, { position: cc.v2(40, 40) })
            .start();
    },

    showSmallSubSymbolFast(subSymbolName) {
        const asset = this.assets[subSymbolName];
        // this.staticSymbol.opacity = 0;
        this.subSymbol.active = true;
        this.subSymbol.opacity = 255;
        this.subSymbolAnim.node.active = false;
        this.subSymbolAnim.node.opacity = 255;
        this.subSymbol.getComponent(cc.Sprite).spriteFrame = asset;
        this.subSymbol.scale = 0.5;
        this.subSymbol.position = cc.v2(40, 40);
    },

    removeSubSymbol() {
        this.subSymbol.scale = 1;
        this.subSymbol.setPosition(0, 0);
        this.subSymbol.active = false;
        this.subSymbolAnim.node.active = false;
        this.subSymbolAnim.node.opacity = 255;
    },

    reset() {
        this.staticSymbol.stopAllActions();
        this.bigSymbol = false;
        this.node.opacity = 255;
        this.staticSymbol.opacity = 255;
        this.subSymbol.opacity = 255;
        this.subSymbolAnim.node.active = false;
        this.subSymbolAnim.node.opacity = 255;
    },

    enableHighlight() {
        this.staticSymbol.opacity = 0;
        this.subSymbol.opacity = 0;
    },

    blinkHighlight(){
        this.node.opacity = 255;
        this.staticSymbol.stopAllActions();
        this.staticSymbol.opacity = 255;
        this.staticSymbol.active = true;
        this.subSymbol.opacity = 255;
    },

    showSubSymbolAnim(subSymbolSkin) {
        this.subSymbolAnim.node.opacity = 255;
        this.subSymbolAnim.node.active = true;
        this.subSymbolAnim.setSkin(subSymbolSkin);
        this.subSymbolAnim.setAnimation(0, 'animation', true);
    },
});