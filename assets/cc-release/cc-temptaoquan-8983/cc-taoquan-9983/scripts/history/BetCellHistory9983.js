const { formatMoney } = require('utils');

cc.Class({
    extends: require("BetCellHistory"),

    properties: {
        dotBonus: cc.Node,
        dotFree: cc.Node,
        dotJackpot: cc.Node,
        positionNodes: {
            default: [],
            type: cc.Node
        },
    },

    updateData(data) {
        this.detailBtn.active = false;

        this.listMode = [];
        this.dotBonus.active = false;
        this.dotFree.active = false;
        this.dotJackpot.active = false;

        const { totalBonusWinAmount, freeGameTotal, totalJpWinAmount } = data;

        if (totalJpWinAmount && totalJpWinAmount > 0) {
            this.dotJackpot.active = true;
            this.listMode.push(this.dotJackpot);
        }
        if (freeGameTotal) {
            this.dotFree.active = true;
            this.listMode.push(this.dotFree);
        }
        if (totalBonusWinAmount && totalBonusWinAmount > 0) {
            this.dotBonus.active = true;
            this.listMode.push(this.dotBonus);
        }
        if (this.listMode.length > 0 && this.positionNodes.length > 0) {
            this.listMode.forEach((item, index) => {
                const position = this.positionNodes[index].position;
                item.setPosition(position);
            });
        }
        if (!data) return;
        this.playSessionId = data.sessionId;
        this.session.getComponent(cc.Label).string = "#" + data.sessionId.substring(data.sessionId.length - 8, data.sessionId.length);
        this.time.getComponent(cc.Label).string = this.formatTimeStamp(Number(data.time));
        this.totalbet.getComponent(cc.Label).string = formatMoney(Number(data.totalBetAmount));
        this.winAmount.getComponent(cc.Label).string = formatMoney(data.totalWinAmount);
        if (this.node.config.PAY_LINE_ALLWAYS)
            this.betLines.getComponent(cc.Label).string = this.totalLineCount;
        else {
            this.betLines.getComponent(cc.Label).string = (data.bettingLines.match(/,/g) || []).length + 1;
        }
        this.detailBtn.active = true;
    },
});
