const { formatMoney } = require('utils');
cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        sessionLabel: cc.Label,
        totalWinLabel: cc.Label,

        content: cc.Node,
    },

    onLoad() {
        this.node.on('DISPLAY_DATA', this.updateData, this);
        this.node.on('CLEAR_TOTAL_DETAIL_DATA', this.resetLabelTotalDetail, this);
        this.mapItem = {};
        this.content.children.forEach(it => {
            this.mapItem[it.getComponent("ItemWinHistory").typeWin] = it;
        });
    },

    resetLabelTotalDetail() {
        this.scrollView && this.scrollView.scrollToTop();
        this.totalWinLabel.string = this.getWinMoney(0);
        this.content.children.forEach(it => {
            it.emit("RESET_DATA");
            it.active = false;
        });
        this.showItem('NORMAL');
        this.showItem('FREE');
        this.showItem('JACKPOT');
        this.showItem('BONUS');
    },

    getWinMoney(money = 0) {
        return formatMoney(money);
    },

    updateData(data) {
        this.node.opacity = 0;
        this.resetLabelTotalDetail();
        let { sessionId, totalWinAmount, freeSummary, totalNormalWinAmount,
            totalFreeWinAmount, totalJpWinAmount, totalBonusWinAmount } = data;


        sessionId = data.sessionId.substring(data.sessionId.length - 8, data.sessionId.length);


        this.totalWinLabel.string = this.getWinMoney(totalWinAmount);

        this.sessionLabel.node.active = true;
        this.sessionLabel.string = `#${sessionId}`;

        this.updateWinAmount('NORMAL', totalNormalWinAmount);
        this.updateWinAmount('FREE', totalFreeWinAmount);
        this.updateWinAmount('JACKPOT', totalJpWinAmount);
        this.updateWinAmount('BONUS', totalBonusWinAmount);

        if (freeSummary && freeSummary.length > 0) {
            freeSummary.forEach(it => {
                if (it.selectOption > 0) { //support for top up game
                    this.showItem('FREE', false);
                    const mode = 'FREE_' + it.selectOption;
                    this.updateWinAmount(mode, it.winAmount, it.winAmount >= 0);
                }
            });
        }


        this.node.opacity = 1;
        this.scheduleOnce(() => {
            this.node.opacity = 255;
        }, 0.02);
    },

    updateWinAmount(mode = '', winAmount = 0, isShow = true) {
        const itemWinHistoryNode = this.mapItem[mode];
        if (itemWinHistoryNode) {
            itemWinHistoryNode.active = isShow;
            itemWinHistoryNode.emit("UPDATE_WIN", winAmount);
        }

    },

    showItem(mode = '', isShow = true) {
        const itemWinHistoryNode = this.mapItem[mode];
        if (itemWinHistoryNode) itemWinHistoryNode.active = isShow;

    },

});
