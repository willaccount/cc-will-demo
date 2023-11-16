cc.Class({
    extends: require('SlotSymbol'),

    onLoad() {
        this._super();

        this.node.changeToOption = this.changeToOption.bind(this);

        this.node.on("CHANGE_TO_OPTION", this.changeToOption.bind(this));
        this.node.on("CHANGE_TO_BLUR_OPTION", this.changeToBlurOption.bind(this));
    },

    playAnimation() {
        this.staticSymbol.opacity = 255;
    },

    changeToOption(index) {
        const asset = this.symbols[index];
        if (this.symbols[index]) {
            this.staticSymbol.opacity = 255;
            this.staticSymbol.getComponent(cc.Sprite).spriteFrame = asset;
        } else {
            this.staticSymbol.opacity = 0;
        }
    },

    changeToBlurOption(index) {
        const asset = this.blurSymbols[index];
        if (this.blurSymbols[index]) {
            this.staticSymbol.opacity = 255;
            this.staticSymbol.getComponent(cc.Sprite).spriteFrame = asset;
        } else {
            this.staticSymbol.opacity = 0;
        }
    },
});