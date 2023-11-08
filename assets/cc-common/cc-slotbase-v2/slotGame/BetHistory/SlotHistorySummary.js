const {formatMoney} = require('utils');
const arrayTypeJackpot = ["MINI","MINOR","MAJOR","GRAND"];

cc.Class({
    extends: cc.Component,

    properties: {
        sessionLabel: cc.Label,
        totalBetLabel: cc.Label,
        totalWinLabel: cc.Label,
        // left pannel
        detailTotalBetLabel: cc.Label,

        // right pannel
        summaryLabel: cc.Label,
        normalSummaryLabel: cc.Label,
        detailNormalSummaryLabel: cc.Label,
        bonusSummaryLabel: cc.Label,
        detailBonusSummaryLabel: cc.Label,
        freeSummaryLabel: cc.Label,
        detailFreeSummaryLabel: cc.Label,
    },

    onLoad () {
        this.node.on('DISPLAY_DATA', this.updateData, this);
        this.node.on('CLEAR_TOTAL_DETAIL_DATA', this.resetLabelTotalDetail, this);
    },

    resetLabelTotalDetail() {
        // left pannel
        this.sessionLabel.string = "";
        this.totalBetLabel.string = "";
        this.detailTotalBetLabel.string = "";
        this.totalWinLabel.string = "";
        // right pannel
        this.summaryLabel.string = "";
        this.normalSummaryLabel.string = "";
        this.detailNormalSummaryLabel.string = "";
        this.bonusSummaryLabel.string = "";
        this.detailBonusSummaryLabel.string = "";
        this.freeSummaryLabel.string = "";
        this.detailFreeSummaryLabel.string = "";

        this.totalBetLabel.node.active = false;
        this.detailTotalBetLabel.node.active = false;
        this.totalWinLabel.node.active = false;

        this.summaryLabel.node.active = false;
        this.normalSummaryLabel.node.active = false;
        this.detailNormalSummaryLabel.node.active = false;
        this.bonusSummaryLabel.node.active = false;
        this.detailBonusSummaryLabel.node.active = false;
        this.freeSummaryLabel.node.active = false;
        this.detailFreeSummaryLabel.node.active = false;
    },

    updateData(data) {
        this.node.opacity = 0;
        this.resetLabelTotalDetail();

        let { sessionId, totalBetAmount, betDenom, totalWinAmount, freeGameTotal,
            totalBonusWinAmount, totalFreeWinAmount, selectedOption, totalJpWinAmount, aAmt, jpInfo } = data;

        this.initAllJackpot(jpInfo);

        sessionId = data.sessionId.substring(data.sessionId.length - 8, data.sessionId.length);

        let mBetAmount = formatMoney(totalBetAmount / betDenom);
        let normalWin = formatMoney(totalWinAmount - (totalFreeWinAmount || 0) - (totalJpWinAmount || 0));
        
        totalBetAmount = formatMoney(totalBetAmount);
        totalWinAmount = formatMoney(totalWinAmount);

        this.sessionLabel.node.active = true;
        this.sessionLabel.string = `Phiên #${sessionId}`;
        // left pannel
        this.totalBetLabel.node.active = true;
        this.totalBetLabel.string = `- Tổng cược: ${totalBetAmount}`;

        this.detailTotalBetLabel.node.active = true;
        this.detailTotalBetLabel.string = `+ Mua: ${mBetAmount}`;
        this.detailTotalBetLabel.string += "\n" + `+ Cược: x${betDenom}`;

        this.totalWinLabel.node.active = true;
        this.totalWinLabel.string = `- Tổng thắng: ${totalWinAmount}`;

        // right pannel
        this.summaryLabel.node.active = true;
        this.summaryLabel.string = "Chi tiết:";

        this.normalSummaryLabel.node.active = true;
        this.normalSummaryLabel.string = `- Quay thường: ${normalWin}`;

        let bonusWin = totalBonusWinAmount || 0;
        if (bonusWin > 0) {
            if (this.jackpotBonus) {
                let indexTypeJP = this.getTypeJackpot(this.jackpotBonus.id);
                this.bonusSummaryLabel.node.active = true;
                this.bonusSummaryLabel.string = `- Chọn hũ: ${arrayTypeJackpot[indexTypeJP]}`;
                this.bonusSummaryLabel.string += " " + formatMoney(bonusWin);
            }
        }

        if (totalFreeWinAmount) {
            let freeWinTotal = totalFreeWinAmount || 0;
            
            this.freeSummaryLabel.node.active = true;
            this.detailFreeSummaryLabel.node.active = true;

            this.freeSummaryLabel.string = "- Quay miễn phí: ";

            // detail free
            if (selectedOption && selectedOption == 1) {
                //FREE 8
                this.detailFreeSummaryLabel.string += "+ Chọn FreeGame \n";
                this.detailFreeSummaryLabel.string += "+ Số lần quay: " + freeGameTotal + "\n";
            } else if (selectedOption && selectedOption == 2) {
                //TOPUP
                this.detailFreeSummaryLabel.string += "+ Chọn Topup \n";
                this.detailFreeSummaryLabel.string += "+ Số lần quay: " + freeGameTotal + "\n";
            }

            //scatter win
            
            let freeWin = freeWinTotal;
            if (aAmt) {
                let {amtA1, amtA2, amtA} = aAmt;
                let totalScatterWinAmount = (amtA1 || 0) + (amtA2 || 0) + (amtA || 0);
                this.detailFreeSummaryLabel.string += "+ Thắng ngọc: " + formatMoney(totalScatterWinAmount) + "\n";
                freeWin = freeWinTotal - totalScatterWinAmount;
            }

            if (selectedOption && selectedOption == 1) {
                this.detailFreeSummaryLabel.string += "+ Thắng Free: "+ formatMoney(freeWin) + "\n";
            }
            if (this.jackpotFreeList && this.jackpotFreeList.length > 0) {
                for (let i =0; i < this.jackpotFreeList.length; i++) {
                    let indexTypeJP = this.getTypeJackpot(this.jackpotFreeList[i].id);
                    if (indexTypeJP >= 0) {
                        this.detailFreeSummaryLabel.string += "+ Thắng hũ: " + arrayTypeJackpot[indexTypeJP] + " " +
                            formatMoney(this.jackpotFreeList[i].amt) + "\n";
                    }
                }
            }
        }
        this.node.opacity = 1;
        this.scheduleOnce(() =>{
            this.node.opacity = 255;
        }, 0.02);
    },

    initAllJackpot(jpInfo) {
        this.jackpotNormal = null;
        this.jackpotBonus = null;
        this.jackpotFreeList = [];

        if (jpInfo) {
            for (let i = 0; i < jpInfo.length; i++) {
                if (jpInfo[i].mode == "bonus") {
                    this.jackpotBonus = jpInfo[i];
                } else if (jpInfo[i].mode == "normal") {
                    this.jackpotNormal = jpInfo[i];
                } else {
                    this.jackpotFreeList.push(jpInfo[i]);
                }
            }
        }
    },

    getTypeJackpot(jackpotId) {
        for (let index = 0; index < arrayTypeJackpot.length; index++) {
            const jp = arrayTypeJackpot[index];
            if (jackpotId.includes(jp)) {
                return (index);
            }
        }
        return -1;
    },
});
