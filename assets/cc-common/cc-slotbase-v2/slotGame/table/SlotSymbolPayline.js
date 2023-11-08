

const {convertAssetArrayToObject} = require('utils');

cc.Class({
    extends: cc.Component,

    properties: {
        staticSymbol: cc.Node,
        symbols: {
            default: [],
            type: cc.SpriteFrame,
        }, 
    },

    onLoad () {
        this.assets = convertAssetArrayToObject(this.symbols);

        this.node.mainComponent = this;
        this.node.changeToSymbol = this.changeToSymbol.bind(this);
        this.node.playAnimation = this.playAnimation.bind(this);
        this.node.stopAnimation = this.stopAnimation.bind(this);
        this.node.blinkHighlight = this.blinkHighlight.bind(this);
        this.node.enableHighlight = this.enableHighlight.bind(this);
        this.node.disableHighlight = this.disableHighlight.bind(this);
        this.node.reset = this.reset.bind(this);

        this.node.on("CHANGE_TO_SYMBOL",this.changeToSymbol,this);
        this.node.on("PLAY_ANIMATION",this.playAnimation,this);
        this.node.on("STOP_ANIMATION",this.stopAnimation,this);
        this.node.on("BLINK_HIGHLIGHT",this.blinkHighlight,this);
        this.node.on("ENABLE_HIGHLIGHT",this.enableHighlight,this);
        this.node.on("DISABLE_HIGHLIGHT",this.disableHighlight,this);
        this.node.on("RESET",this.reset,this);
    },
    changeToSymbol(symbolName) {
        const asset = this.assets[symbolName];
        if (this.assets[symbolName]) {
            this.node.symbol = symbolName; // for easy debug
            this.staticSymbol.opacity = 255;
            this.staticSymbol.getComponent(cc.Sprite).spriteFrame = asset;
            this.staticSymbol.width = asset.getOriginalSize().width;
            this.staticSymbol.height = asset.getOriginalSize().height;
        } else {
            this.staticSymbol.opacity = 0;
        }
    },
    playAnimation(){},
    stopAnimation(){},
    blinkHighlight(duration,blinks){
        this.node.opacity = 255;
        var action = cc.blink(duration*blinks,blinks);
        this.staticSymbol.active = true;
        this.staticSymbol.runAction(action);
    },
    enableHighlight() {
        this.node.opacity = 255;
    },
    disableHighlight() {
        this.node.opacity = 0;
    },
    reset() {
        this.node.opacity = 255;
    },
});
