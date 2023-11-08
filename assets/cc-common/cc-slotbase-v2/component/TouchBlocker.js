

cc.Class({
    extends: cc.Component,

    properties: {
        touchDelay: 0.5,
        block: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.block.active = false;
        let canvas = cc.find('Canvas');
        let buttons = canvas.getComponentsInChildren(cc.Button);
        this.currentTarget = null;
        buttons.forEach(bt => {
            bt.node.on('touchstart', ()=>{
                this.currentTarget = bt.node;
                this.onTouchStart();
            });
            bt.node.on('touchend', ()=>{
                this.onTouchEnd();
            });
            bt.node.on('touchcancel', ()=>{
                this.onTouchEnd();
            });
        });
    },

    onTouchStart()
    {
        this.block.active = true;
        this.checkActive = true;
        this._unlockFunc= () => {
            this.block.active = false;
            this.checkActive = false;
            this._unlockFunc = null;
        };
        this.scheduleOnce(this._unlockFunc, this.touchDelay);
    },

    onTouchEnd()
    {   
        if(this._unlockFunc){
            this.unschedule(this._unlockFunc);
            this._unlockFunc();
        }
        
    },

});
