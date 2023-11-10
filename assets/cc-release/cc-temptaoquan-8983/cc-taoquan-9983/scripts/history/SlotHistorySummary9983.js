
cc.Class({
    extends: require("SlotHistorySummaryImagesv2"),
    updateData(data) {
        this.node.opacity = 0;
        this.resetLabelTotalDetail();
        let { sessionId, totalWinAmount, totalNormalWinAmount,
            totalFreeWinAmount, totalJpWinAmount, totalBonusWinAmount, jpInfo } = data;

        let totalJPGrand = 0;
        let totalJPGMajor = 0;
        if (jpInfo) {
            jpInfo.forEach(jp => {
                if (jp.id.includes("GRAND")) {
                    totalJPGrand += jp.amt;
                }
                if (jp.id.includes("MAJOR")) {
                    totalJPGMajor += jp.amt;
                }
            });
        }
        sessionId = data.sessionId.substring(data.sessionId.length - 8, data.sessionId.length);


        this.totalWinLabel.string = this.getWinMoney(totalWinAmount);

        this.sessionLabel.node.active = true;
        this.sessionLabel.string = `#${sessionId}`;

        this.updateWinAmount('NORMAL', totalNormalWinAmount);
        this.updateWinAmount('FREE', totalFreeWinAmount);
        if ((totalJPGrand + totalJPGMajor) === totalJpWinAmount) {
            this.updateWinAmount('JACKPOT_GRAND', totalJPGrand);
            this.updateWinAmount('JACKPOT_MAJOR', totalJPGMajor);
        }
        this.updateWinAmount('BONUS', totalBonusWinAmount);

        this.node.opacity = 1;
        this.scheduleOnce(() => {
            this.node.opacity = 255;
        }, 0.02);
    },
});
