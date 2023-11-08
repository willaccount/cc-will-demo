

cc.Class({
    extends: cc.Component,

    properties: {
        lblNotify : cc.Label,
        delayTime : 1.5
    },

    onLoad() {
        this.node.on("SHOW_TOAST_MESSAGE", this.showMessage.bind(this));
        this.node.active = false;
    },

    showMessage(val, anchor) {
        this.lblNotify.string = val;
        this.node.opacity = 255;
        this.node.active = true;
        this.node.stopAllActions();
        this.node.scale = 0.5;
        this.node.runAction(cc.sequence(cc.scaleTo(0.2,1), cc.delayTime(this.delayTime), cc.callFunc(()=>{
            this.node.active = anchor ? true : false;
        })));
    },

    onDestroy() {
        this.node.off("SHOW_TOAST_MESSAGE", this.showMessage.bind(this));
    },

    stopShowMessage(){
        this.node.active = false;
    }
});
