

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on("PLAY",this.play,this);
        this.node.on("HIDE",this.close,this);
        this.node.on("INIT", this.init, this);
        this.node.opacity = 0;
        this.onLoadExtended();
        this.node.active = false;
    },

    onLoadExtended(){
        // override this if add more in onLoad
    },

    init(mainDirector) {
        this.node.mainDirector = mainDirector;
    }, 

    play(content, callback) {
        this.content = content;
        this.callback = callback;
        let {instantly} = content;
        this.instantly = instantly;
        this.node.active = true;
        this.enter();
        if(this.instantly == true){
            this.show();
        }else{
            this.playOpeningAnimation();
        }
    },

    playOpeningAnimation(){
        // TODO: override it with animation actions
        if(this._openingAction!=null && this._openingAction.target != null){
            this.node.stopAction(this._openingAction);
        }
        this._openingAction = cc.sequence(cc.delayTime(0.5), cc.callFunc(()=>{
            this.show();
        }));
        this.node.runAction(this._openingAction);
    },

    playClosingAnimation(){
        // TODO: override it with animation actions
        if(this._closingAction!=null && this._closingAction.target != null){
            this.node.stopAction(this._closingAction);
        }
        this._closingAction = cc.sequence(cc.delayTime(0.5), cc.callFunc(()=>{
            this.resetNode();
            this.exit();
        }));
        this.node.runAction(this._closingAction);
    },

    show() {
        this.node.opacity = 255;
    },

    enter() {
        // Overwrite this when extends
        
    },

    close(){
        if(this.instantly == true){
            this.resetNode();
            this.exit();
        }else{
            this.playClosingAnimation();
        }
    },

    resetNode(){
    },

    exit() {
        if (this.callback && typeof this.callback == "function") {
            this.node.emit("STOP");
            this.callback();
        }
        if(this._openingAction!=null && this._openingAction.target != null){
            this.node.stopAction(this._openingAction);
        }
        if(this._closingAction!=null && this._closingAction.target != null){
            this.node.stopAction(this._closingAction);
        }
        this._openingAction = null;
        this._closingAction = null;
        this.content = null;
        this.callback = null;
        this.node.opacity = 0;
        this.node.active = false;
    }
});