
cc.Class({
    extends: require('SlotSymbol'),

    properties: {
        subSymbol: cc.Node,
        smallSubSymbol: cc.Node,
    },

    onLoad() {
        this._super();

        this.registerMessages();
        this.staticSymbolSprite = this.staticSymbol.getComponent(cc.Sprite);
    },

    registerMessages() {
        this.node.on("ADD_SUB_SYMBOL", this.showSubSymbol, this);
        this.node.on("REMOVE_SUB_SYMBOL", this.removeSubSymbol, this);
        this.node.on("CHANGE_TO_FAKE_SYMBOL", this.changeToFakeSymbol, this);

        // this.node.addSmallSubSymbol = this.addSmallSubSymbol.bind(this); 
        // this.node.showSmallSubSymbol = this.showSmallSubSymbol.bind(this); 
        // this.node.addWildSymbol = this.addWildSymbol.bind(this);
        // this.node.removeWildSymbol = this.removeWildSymbol.bind(this);
    },

    showSubSymbol(symbolName) {
        if (this.isFakeSymbol) return;
        const asset = this.assets[symbolName];
        this.staticSymbol.opacity = 0;
        this.subSymbol.active = true;
        this.subSymbol.opacity = 255;
        this.smallSubSymbol.active = false;
        this.smallSubSymbol.opacity = 0;
        this.smallSubSymbol.getComponent(cc.Sprite).spriteFrame = asset;
        this.subSymbol.getComponent(cc.Sprite).spriteFrame = asset;

        this.showSmallSubSymbol();
    },

    showSmallSubSymbol() {
        if (this.isFakeSymbol) return;
        this.subSymbol.stopAllActions();
        this.smallSubSymbol.active = false;
        this.subSymbol.active = true;
        this.subSymbolTween = cc.tween(this.subSymbol);
        this.subSymbolTween
            .delay(1)
            .to(0.2, { scale: 0.5 })
            .to(0.2, { position: cc.v2(40, 40) })
            .call(() => {
                this.subSymbol.scale = 1;
                this.subSymbol.setPosition(0, 0);
                this.smallSubSymbol.active = true;
                this.smallSubSymbol.opacity = 255;
                this.subSymbol.active = false;
            })
            .start();
    },

    removeSubSymbol() {
        this.subSymbol.active = false;
        this.smallSubSymbol.active = false;
    },

    enableHighlight() {
        this.staticSymbol.opacity = 0;
        this.subSymbol.opacity = 0;
        this.smallSubSymbol.opacity = 0;
    },

    blinkHighlight() {
        this.node.opacity = 255;
        this.staticSymbol.stopAllActions();
        this.staticSymbol.opacity = 255;
        this.staticSymbol.active = true;
        this.subSymbol.opacity = 255;
        this.smallSubSymbol.opacity = 255;
    },

    disableHighlight() {
        this.staticSymbol.stopAllActions();
        this.staticSymbol.opacity = 100;
        this.subSymbol.opacity = 0;
        this.smallSubSymbol.opacity = 0;
    },

    reset() {
        this.staticSymbol.stopAllActions();
        this.bigSymbol = false;
        this.subSymbol.active = false;
        this.smallSubSymbol.active = false;
        this.node.opacity = 255;
        this.staticSymbol.opacity = 255;
        this.subSymbol.opacity = 255;
        this.smallSubSymbol.opacity = 255;
    },

    changeToFakeSymbol(symbolName) {
        this.staticSymbolSprite.spriteFrame = this.assets[symbolName];
    },
});