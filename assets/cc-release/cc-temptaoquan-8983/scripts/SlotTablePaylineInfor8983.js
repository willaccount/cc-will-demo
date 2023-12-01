const SlotTablePaylineInfor = require('SlotTablePaylineInfo');
const {convertAssetArrayToObject} = require('utils');
const {formatMoney} = require('utils');

cc.Class({
    extends: SlotTablePaylineInfor,

    showPaylineInfoAllways({line}){
        const {symbolId, totalWinAmount, symbolCount, combination, payableSymbol} = line;
        const betDenom = this.calculateBetDenom();
        
        this.lbLeft.string = Number(symbolCount);
        this.imgSymbol.getComponent(cc.Sprite).spriteFrame = this.assets[this.smallSymbolPrefix + symbolId];

        const symbolPayTableString = `${this.winText}`;
        const combinationString = combination > 1 ? ' (x' + combination + ') = ' : ' = ';
        const calculateDenom = ' = ' + formatMoney((payableSymbol * combination))+ ' xu x ' + formatMoney(betDenom) + ' = ';
        const winAmount = formatMoney(totalWinAmount) + 'đ';
        this.lbRight.string = symbolPayTableString + combinationString + winAmount;
        this.node.active = true;
    },
});
