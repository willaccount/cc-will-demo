const { formatMoney } = require('utils');
const { MODE_POS } = require('CustomType');

cc.Class({
    extends: require("BetCellHistory"),

    properties: {
        modePos : [MODE_POS],
        dotBonusJp: cc.Node,
        dotTopUp: cc.Node,
        dotFree: cc.Node,
    },

    updateData(data) {
        this.detailBtn.active = false;

        if (!data) return;
        this.listMode = [];
        this.dotBonusJp.active = false;
        this.dotFree.active = false;
        this.dotTopUp.active = false;

        const {totalBonusWinAmount, totalJpWinAmount} = data;
        if ((totalBonusWinAmount && totalBonusWinAmount > 0) 
            || (totalJpWinAmount && totalJpWinAmount > 0)) {
            this.dotBonusJp.active = true;
            this.listMode.push(this.dotBonusJp);
        }

        const {selectedOption} = data;
        if (selectedOption && selectedOption > 0) {
            if (selectedOption == 2) {
                this.dotTopUp.active = true;
                this.listMode.push(this.dotTopUp);
            } else if (selectedOption == 1) {
                this.dotFree.active = true;
                this.listMode.push(this.dotFree);
            }
        }
       
        if (this.listMode.length > 0){
            let arrPos = this.modePos[this.listMode.length-1].pos;
            this.listMode.forEach((it, index)=>{
                it.x = arrPos[index].x;
                it.y = arrPos[index].y;
            });
        }
        
        this.playSessionId = data.sessionId;
        this.session.getComponent(cc.Label).string = "#" + data.sessionId.substring(data.sessionId.length-8, data.sessionId.length);
        this.time.getComponent(cc.Label).string = this.formatTimeStamp(parseInt(data.time));
        this.totalbet.getComponent(cc.Label).string = formatMoney(Number(data.totalBetAmount));
        this.winAmount.getComponent(cc.Label).string = formatMoney(data.totalWinAmount);
        if (this.node.config.PAY_LINE_ALLWAYS)
            this.betLines.getComponent(cc.Label).string = this.totalLineCount;
        else
        {
            this.betLines.getComponent(cc.Label).string = (data.bettingLines.match(/,/g) || []).length + 1;
        }
        this.detailBtn.active = true;

        this.dataDetail = data;
    },
});
