const { formatMoney } = require('utils');
cc.Class({
    extends: cc.Component,

    properties: {
        valueWin : cc.Node,
        typeWin  : "NORMAL"
    },

    onLoad(){
        this.node.on("UPDATE_WIN", this.updateWin.bind(this));
        this.node.on("RESET_DATA", this.reset.bind(this));
        this.node.typeWin = this.typeWin;
        this.currentWin = 0;
    },

    reset(){
        this.currentWin = 0;
        this.updateWin(0);
    },

    updateWin(winAmount = 0){
        this.currentWin += winAmount;
        this.valueWin.getComponent(cc.Label).string = this.getWinMoney(this.currentWin);
    },

    getWinMoney(money = 0){
        return formatMoney(money);
    }
});
