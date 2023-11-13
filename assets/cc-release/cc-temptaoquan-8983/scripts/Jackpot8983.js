const { findKeyByValue, formatMoney } = require('utils');

cc.Class({
    extends: require('Jackpot'),

    onLoad() {
        this._super();
        this.node.on("UPDATE_VALUE_JACKPOT", this.updateValueJP, this);
    },

    renderJackpot() {
        this.renderJP({
            node: this.grand,
            value: this.jackpotData[this.JP_Names[0]],
        });
        this.renderJP({
            node: this.major,
            value: this.jackpotData[this.JP_Names[1]],
        });
    },
    updateValueJP(isGrand = true, value) {
        if (isGrand) {
            this.renderJP({
                node: this.grand,
                value: value,
                time: 100
            });
        } else {
            this.renderJP({
                node: this.major,
                value: value,
                time: 100
            });
        }

    }

});
