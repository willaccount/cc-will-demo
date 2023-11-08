
const { formatMoney } = require('utils');
cc.Class({
    extends: cc.Component,

    properties: {
        betOptionValue : cc.Label
    },

    onLoad() {
        this.node.on('UPDATE_DATA', this.updateData, this);
        this.node.updateData = this.updateData.bind(this);
    },

    updateData(values, index,  controller) {
        this.controller = controller;
        this.betOptionValue.string = formatMoney(values);
        this.itemIndex = index;
    },

    onClick() {
        if (!this.controller.getSelectBlocked()) {
            this.controller.setStopTouchUp();
            this.controller.selectBet(this.itemIndex, 0.5);
        }
    }
});
