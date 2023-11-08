

cc.Class({
    extends: cc.Component,

    properties: {
        collectByTime: false,
        collectAtStart: false,
        timeInterval: 60,
    },

    onLoad (){
        this.node.on("GARBAGE_COLLECT", this.runGC, this);
    },

    start () {
        this._gcAction = cc.repeatForever(cc.sequence(cc.delayTime(this.timeInterval), cc.callFunc(()=>{
            this.runGC();
        })));
        if(this.collectAtStart){
            this.runGC();
        }
        if(cc.sys.isNative && this.collectByTime == true){
            this.node.runAction(this._gcAction);
        }
    },

    runGC(){
        if(cc.sys.isNative){
            cc.sys.garbageCollect();
            cc.log(`Run Garbage Collector On Native`);
        }
    },

    onDisable(){
        if(this._gcAction && this._gcAction.target !=null){
            this.node.stopAction(this._gcAction);
        }
        this.runGC();
        this.node.off("GARBAGE_COLLECT", this.runGC, this);
    },
});
