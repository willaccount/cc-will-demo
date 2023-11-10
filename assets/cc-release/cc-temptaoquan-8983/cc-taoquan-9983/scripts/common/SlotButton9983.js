cc.Class({
    extends: require('SlotButtonV2'),

    properties: {
        spinEffect: cc.Node,
    },

    showSpin(){
        this._super();
        if(this.spinEffect){
            this.spinEffect.emit("ON_SPIN_SHOW");
        }
    },
});
