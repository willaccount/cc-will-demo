const EventListenerManager = require("EventListenerManager");
cc.Class({
    extends: cc.Component,

    properties: {
        gradient : cc.Node,
        infoSymbol : cc.Node,
        touchBlocks: [cc.Node],
    },

    onLoad() {
        this.node.showInfoSymbol = this.showInfoSymbol.bind(this);
        this.node.hideInfoSymbol = this.hideInfoSymbol.bind(this);
        this.infoSymbol.on(cc.Node.EventType.TOUCH_END, this.onInfoSymbolTouchEnded, this);
        let serviceId = this.node.config.GAME_ID || "9966";
        this.eventListenerManager = EventListenerManager.getInstance(serviceId);
        this.registerEvent();
        this.node.active = false;
        for(let i = 0; i< this.touchBlocks.length; i++){
            this.touchBlocks[i].on(cc.Node.EventType.TOUCH_START, this.onBlockTouchStarted, this);
        }
    },

    registerEvent() {
        if (this.eventListenerManager) {
            this.eventListenerManager.on("SHOW_SYMBOL_PAYTABLE_INFO", this.showInfoSymbol, this);
            this.eventListenerManager.on("HIDE_SYMBOL_PAYTABLE_INFO", this.hideInfoSymbol, this);
        }
    },
    unRegisterAll() {
        if (this.eventListenerManager) {
            this.eventListenerManager.targetOff(this);
        }
    },

    showInfoSymbol(wLocation, symbol , spineData, spineBorder) {
        const pos = this.gradient.parent.convertToNodeSpaceAR(wLocation);
        if(!this.gradient.getBoundingBox().contains(pos)) {
            return;
        }
        
        if (this.node.active == false){
            this.node.active = true;
            this.infoSymbol.active = true;
            this.node.opacity = 0;
            this.twFadeIn && this.twFadeIn.stop();
            this.twFadeIn = cc.tween(this.node)
                .to(0.03, {opacity : 255})
                .call(()=>{
                    this.twFadeIn = null;
                    if(this.eventListenerManager){
                        this.eventListenerManager.emit("ON_SHOW_SYMBOL_INFO", true);
                    }
                    this.showTouchBlocks();
                })
                .start();
        }
        const SYMBOL_SPECIALS = (this.node.config && this.node.config.SYMBOL_SPECIALS) || [];
        if (SYMBOL_SPECIALS.indexOf(symbol.mainComponent.symbolName) !== -1) {
            this.node.soundPlayer && this.node.soundPlayer.playGodTap();
        } else {
            this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
        }
        const symbolName = symbol.mainComponent.symbolName;
        const p1 = symbol.parent.convertToWorldSpaceAR(symbol.getPosition());
        const p2 = this.infoSymbol.parent.convertToNodeSpaceAR(p1);
        this.infoSymbol.emit("UPDATE_DATA", symbol.mainComponent.symbolName,spineData, spineBorder);
        if (symbol.isLeftBorder) {
            this.infoSymbol.emit("UPDATE_LAYOUT", cc.Layout.HorizontalDirection.LEFT_TO_RIGHT, p2, symbolName);
        } else if (symbol.isRightBorder) {
            this.infoSymbol.emit("UPDATE_LAYOUT", cc.Layout.HorizontalDirection.RIGHT_TO_LEFT, p2, symbolName);
        } else if (symbol.isMiddle) {
            this.infoSymbol.emit("UPDATE_LAYOUT", cc.Layout.HorizontalDirection.LEFT_TO_RIGHT, p2, symbolName);
        }
    },

    hideInfoSymbol(){
        this.twFadeOut && this.twFadeOut.stop();
        this.twFadeOut = cc.tween(this.node)
            .to(0.03, {opacity : 0})
            .call(()=>{
                this.twFadeOut = null;
                if(this.eventListenerManager){
                    this.eventListenerManager.emit("ON_SHOW_SYMBOL_INFO", false);
                }
                this.infoSymbol.emit("RESET_ANIM");
                this.infoSymbol.active = false;
                this.node.active  = false;
            })
            .start();
    },

    onDestroy(){
        this.unRegisterAll();
    },

    onBlockTouchStarted(){
        this.showTouchBlocks(false);
        cc.log(">>> On Touch Started on Block!");
        this.hideInfoSymbol();
    },

    showTouchBlocks(isOn = true){
        for(let i = 0; i< this.touchBlocks.length; i++){
            this.touchBlocks[i].active = isOn;
        }
    },

    onInfoSymbolTouchEnded(event){
        if(event) event.stopPropagation();
        this.hideInfoSymbol();
    }

});
