

cc.Class({
    extends: cc.Component,

    properties: {
        label: cc.Node,
        labelPromotion: cc.Label
    },

    onLoad(){
        this.node.on("UPDATE_SPINTIMES",this.updateSpintimes,this);
        this.node.on("RESET_SPINTIMES",this.resetSpintimes,this);
        this.node.active = false;
    },
    start () {
    },
    
    resetSpintimes() {
        this.label.getComponent(cc.Label).string = '';
        if(this.labelPromotion){
            this.labelPromotion.string = '';
        }
        this.node.active = false;
    },

    updateSpintimes(spinTimes = 0) {
        const {isAutoSpin, promotion} = this.node.gSlotDataStore;
        if ((spinTimes >= 0 && isAutoSpin) || promotion) {
            this.node.active = true;
        } else {
            this.node.active = false;
        }

        if (spinTimes > 100) {
            this.label.getComponent(cc.Label).string = "∞";
        } else {
            this.label.getComponent(cc.Label).string = spinTimes;
            if (this.labelPromotion) {
                this.labelPromotion.string = spinTimes;
            }
        }
    },
});
