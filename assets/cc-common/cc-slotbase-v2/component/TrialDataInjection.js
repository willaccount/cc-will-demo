

cc.Class({
    extends: cc.Component,

    properties: {
        trialDataName: cc.String,
    },

    onLoad () {
        this._trialData = require(this.trialDataName);
        this.node.trialData = this._trialData;
    },
});
