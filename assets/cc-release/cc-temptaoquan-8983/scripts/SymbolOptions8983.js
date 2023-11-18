cc.Class({
    extends: require('SlotSymbol'),

    onLoad() {
        this._super();

        this.node.on("CHANGE_TO_BLUR_SYMBL", this.changeToBlurSymbol, this);
        
        this.staticSymbolSprite = this.staticSymbol.getComponent(cc.Sprite);
    },

    changeToSymbol(index) {
        const asset = this.symbols[index];
        if (this.symbols[index]) {
            this.staticSymbol.opacity = 255;
            this.staticSymbolSprite.spriteFrame = asset;
        } else {
           this.staticSymbolSprite.opacity = 0;
        }
    },

    changeToBlurSymbol(index) {
        const asset = this.blurSymbols[index];
        if (this.blurSymbols[index]) {
            this.staticSymbol.opacity = 255;
            this.staticSymbolSprite.spriteFrame = asset;
        } else {
            this.changeToSymbol(index);
        }
    },

    logName() {
        cc.log(this.staticSymbolSprite.spriteFrame);
    }
});