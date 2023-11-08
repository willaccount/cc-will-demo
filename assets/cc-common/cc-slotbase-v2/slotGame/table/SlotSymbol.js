

const {convertAssetArrayToObject} = require('utils');

cc.Class({
    extends: cc.Component,

    properties: {
        staticSymbol: cc.Node,
        animIntroPrefab : cc.Prefab,
        symbols: {
            default: [],
            type: cc.SpriteFrame,
        }, 
        blurSymbols: [cc.SpriteFrame]
    },

    onLoad () {
        this.assets = convertAssetArrayToObject(this.symbols);
        this.blurAssets = convertAssetArrayToObject(this.blurSymbols);
        this.node.mainComponent = this;
        this.node.changeToSymbol = this.changeToSymbol.bind(this);
        this.node.changeToBlurSymbol = this.changeToBlurSymbol.bind(this);
        this.node.playAnimation = this.playAnimation.bind(this);
        this.node.stopAnimation = this.stopAnimation.bind(this);
        this.node.blinkHighlight = this.blinkHighlight.bind(this);
        this.node.enableHighlight = this.enableHighlight.bind(this);
        this.node.disableHighlight = this.disableHighlight.bind(this);
        this.node.startBlur = this.startBlur.bind(this);
        this.node.stopBlur = this.stopBlur.bind(this);
        this.node.reset = this.reset.bind(this);
        this.node.addAnimIntro = this.addAnimIntro.bind(this);
        this.node.hideAnimIntro = this.hideAnimIntro.bind(this);

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
        this.symbolName = symbolName;
        if (this.assets[symbolName]) {
            this.node.symbol = symbolName; // for easy debug
            this.staticSymbol.opacity = 255;
            this.staticSymbol.getComponent(cc.Sprite).spriteFrame = asset;

            //Quick check using name convention
            if (symbolName.length > 3) {
                this.bigSymbol = true;
            }
        } else {
            this.staticSymbol.opacity = 0;
        }
    },
    getSymbolName() {
        return this.symbolName;
    },
    changeToBlurSymbol(symbolName){
        if(this.blurAssets[symbolName]){
            this.node.symbol = symbolName;
            this.staticSymbol.opacity = 255;
            this.staticSymbol.getComponent(cc.Sprite).spriteFrame = this.blurAssets[symbolName];
        }else{
            this.changeToSymbol(symbolName);
        }
    },
    playAnimation(){},
    stopAnimation(){
        if (this.bigSymbol) return;

    },
    blinkHighlight(duration,blinks){
        this.node.opacity = 255;
        if (this.bigSymbol) return;

        var action = cc.blink(duration*blinks,blinks);
        this.staticSymbol.active = true;
        this.staticSymbol.runAction(action);
    },
    enableHighlight() {
        this.node.opacity = 255;
    },
    disableHighlight() {
        if (this.bigSymbol) return;
        //maybe we will handle the big symbol from here, so it will never be dim
        this.node.opacity = 100;
    },
    reset() {
        this.staticSymbol.stopAllActions();
        this.staticSymbol.opacity = 255;
        this.bigSymbol = false;
        this.node.opacity = 255;
    },
    startBlur(blur = 0.1)
    {
        this.staticSymbol.emit('ACTIVE_BLUR', blur);
    },
    stopBlur()
    {
        this.staticSymbol.emit('STOP_BLUR');
    },

    addAnimIntro(anim){
        if (!this.animIntro) {
            this.staticSymbol.opacity = 0;
            this.animIntro = cc.instantiate(this.animIntroPrefab);
            this.node.addChild(this.animIntro);
            this.animIntro.zIndex = this.staticSymbol.zIndex + 1;
        }
        this.animIntro.getChildByName('anim').removeAllChildren();
        this.animIntro.getChildByName('anim').addChild(anim);
    },

    hideAnimIntro(){
        if (this.animIntro) {
            this.animIntro.removeAllChildren();
            this.animIntro.active = false;
        }
        this.staticSymbol.opacity = 255;
    },
});
