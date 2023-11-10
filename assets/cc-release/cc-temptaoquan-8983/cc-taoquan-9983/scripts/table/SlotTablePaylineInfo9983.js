const {convertAssetArrayToObject,formatMoney} = require('utils');
cc.Class({
    extends: cc.Component,

    properties: {
        numOfSymbols: cc.Label,
        symbol: cc.Sprite,
        winAmount: cc.Label,
        equalSymbol: cc.Node,
        combinationString: cc.Label,
        imageList: [cc.SpriteFrame],
    },

    start()
    {
        this.node.on("SHOW_PAYLINE",this.showPaylineInfo,this);
        this.node.on("HIDE_PAYLINE",this.hidePaylineInfo,this);
        this.assets = convertAssetArrayToObject(this.imageList);
        this.node.active = false;
    },
    showPaylineInfo({line})
    {
        this.node.active = true;
        const {payLineSymbol, payLineWinNumbers, payLineWinAmount, paylineMaxColumn, wildMultiplier} = line;
        this.equalSymbol.active = false;
      
        this.combinationString.node.active = false;

        this.numOfSymbols.string = Number(paylineMaxColumn);
        this.symbol.spriteFrame = this.assets[payLineSymbol];
        this.winAmount.string = formatMoney(payLineWinAmount);

        if (Number(payLineWinNumbers) > 1)
        {
            this.equalSymbol.active = true;
            let winPerline = formatMoney(Number(payLineWinAmount / payLineWinNumbers / wildMultiplier));
            this.combinationString.node.active = true;
            this.combinationString.string = winPerline + " x " + this.formatMoneyPayline(payLineWinNumbers);
            if(wildMultiplier > 1){
                this.combinationString.string += " x " + Number(wildMultiplier);
            }
        } else if (wildMultiplier > 1) {
            this.equalSymbol.active = true;
            let winPerline = formatMoney(Number(payLineWinAmount  / wildMultiplier));
            this.combinationString.node.active = true;
            this.combinationString.string = winPerline + " x " + Number(wildMultiplier);
        }
    },

    formatMoneyPayline: function (amount, decimalCount = 0, decimal = ".", thousands = ",") {
        try {
            decimalCount = Math.abs(decimalCount);
            decimalCount = isNaN(decimalCount)
                ? 2
                : decimalCount;

            const negativeSign = amount < 0
                ? "-"
                : "";

            let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
            let j = (i.length > 3)
                ? i.length % 3
                : 0;

            return negativeSign + (
                j
                    ? i.substr(0, j) + thousands
                    : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (
                    decimalCount
                        ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2)
                        : "");
        } catch (e) {
            cc.log(e);
        }

        return 0;
    },

    hidePaylineInfo(){
        this.node.active = false;
    }
});
