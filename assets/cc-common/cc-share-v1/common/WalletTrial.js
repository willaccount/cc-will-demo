

cc.Class({
    extends: cc.Component,

    properties: {
        display: cc.Label,
        animateNumber: require("animateNumberLabel")
    },

    initValue(value)
    {
        this.currentValue = value;
        this.animateNumber.onUpdateWallet(this.currentValue, 0);
    },

    addValue(value)
    {
        if (value)
        {
            this.currentValue += value;
            this.animateNumber.onUpdateWallet(this.currentValue, 100);
        }
    }
});
