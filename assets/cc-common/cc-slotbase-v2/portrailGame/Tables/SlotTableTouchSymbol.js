const EventListenerManager = require("EventListenerManager");
cc.Class({
    extends: cc.Component,

    properties: {
        spineAnimBorder : 'VFX_WinFrame'
    },

    onLoad() {
        this.init();
        this.node.on("ALLOW_TOUCH_SYMBOL", this.allowTouchSymbol.bind(this));
        let serviceId = this.node.config.GAME_ID || "9966";
        this.eventListenerManager = EventListenerManager.getInstance(serviceId);
        this.registerEvent();
    },

    registerEvent() {
        if (this.eventListenerManager) {
            this.eventListenerManager.on("ON_SHOW_SYMBOL_INFO", this.onShowSymbolInfo, this);
        }
    },
    unRegisterAll() {
        if (this.eventListenerManager) {
            this.eventListenerManager.targetOff(this);
        }
    },

    start() {
        this.GUI = this.node.mainDirector && this.node.mainDirector.director.gui;
    },

    allowTouchSymbol(isAllow = false){
        this.isAllowTouchSymbol = isAllow;
        this.GUI && this.GUI.emit('HIDE_INFO_SYMBOL');
    },

    init(){
        this.canvas = cc.find('Canvas');
        if(this.canvas){
            this.camera = this.canvas.getComponentInChildren(cc.Camera);
        }

        if(this.camera){
            this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        }
    },

    onTouchEnd(event){
        if(this.node.mainDirector.director.isTutorialShowing())
            return;
        let wlocation = new cc.Vec2(0,0);
        this.camera.getScreenToWorldPoint(event.getLocation(), wlocation);
        if (this.isAllowTouchSymbol == false) return;

        this.allSymbols = this.getAllSymbol();
        for (let index = 0; index < this.allSymbols.length; ++index) {
            let symbol = this.allSymbols[index];
            this.curPoint = symbol.parent.convertToNodeSpaceAR(wlocation);
            let rect = symbol.getBoundingBox();
            if (rect.contains(this.curPoint)){
                const spineData = this.findSpineData(symbol.mainComponent.symbolName);
                const spineBorder = this.findSpineData(this.spineAnimBorder);
                this.GUI && this.GUI.emit('SHOW_INFO_SYMBOL', wlocation, symbol , spineData, spineBorder);
            }
        }

    },

    findSpineData(animName) {
        return this.node.mainDirector.director.spineSkeletonDatabase.getSpineSkeletonData(animName);
    },

    onShowSymbolInfo(){
        //override here
    },

    getAllSymbol(){
        const arr = [];
        for (let col = 0; col < this.node.reels.length; ++col) {
            const reel = this.node.reels[col];
            reel.showSymbols.forEach(it=>{
                arr.push(it);
                it.isLeftBorder  = col === 0 || col == 1;
                it.isRightBorder = col === (this.node.reels.length - 1) || col === (this.node.reels.length - 2);
                it.isMiddle      = it.isLeftBorder === false && it.isLeftBorder === false;
            });
        }
        return arr;
    },

    onDestroy(){
        this.unRegisterAll();
    }
});
