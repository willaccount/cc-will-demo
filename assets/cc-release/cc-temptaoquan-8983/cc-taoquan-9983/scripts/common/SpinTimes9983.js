cc.Class({
    extends: require('SpinTimes'),
    properties: {
    },

    activeSpintimes() {
        
    },

    resetSpintimes() {
        this.label.getComponent(cc.Label).string = '';
        if (this.labelPromotion) {
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
