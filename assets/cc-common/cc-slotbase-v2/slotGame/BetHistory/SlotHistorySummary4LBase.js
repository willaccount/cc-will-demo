const { formatMoney } = require('utils');
const arrayTypeJackpot = ["MINI","MINOR","MAJOR","GRAND"];
cc.Class({
    extends: require("SlotHistorySummary"),

    properties: {
        normalName : "Quay Thường",
        freeGameName : "FreeGame",
        topUpName  : "Topup",
    },
    
    updateData(data) {
        this.node.opacity = 0;
        this.resetLabelTotalDetail();

        let { sessionId, totalBetAmount, betDenom, totalWinAmount, freeGameTotal,
            totalBonusWinAmount, totalFreeWinAmount, selectedOption, totalJpWinAmount, scatterAmount, jpInfo } = data;

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
        this.totalBetLabel.string = `Tổng cược: ${totalBetAmount}`;

        this.detailTotalBetLabel.node.active = true;
        this.detailTotalBetLabel.string = `- Mua: ${mBetAmount}`;
        this.detailTotalBetLabel.string += "\n" + `- Cược: x${betDenom}`;

        this.totalWinLabel.node.active = true;
        this.totalWinLabel.string = `Tổng thắng: ${totalWinAmount}`;

        // right pannel
        this.summaryLabel.node.active = true;
        this.summaryLabel.string = "Chi tiết:";

        this.normalSummaryLabel.node.active = true;
        this.normalSummaryLabel.string = `- Quay thường: ${normalWin}`;

        if (this.jackpotNormal) {
            this.detailNormalSummaryLabel.node.active = true;
            this.detailNormalSummaryLabel.string += "+ Thắng hũ: " + arrayTypeJackpot[this.getTypeJackpot(this.jackpotNormal.id)] + " " +
                            formatMoney(this.jackpotNormal.amt) + "\n";
        }    

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

            this.freeSummaryLabel.string = "- Thưởng đặc biệt: ";

            // detail free
            if (selectedOption && selectedOption == 1) {
                //FREE 8
                this.detailFreeSummaryLabel.string += "+ Chọn " + this.freeGameName + ". \n";
                this.detailFreeSummaryLabel.string += "+ Số lần quay: " + freeGameTotal + "\n";
            } else if (selectedOption && selectedOption == 2) {
                //TOPUP
                this.detailFreeSummaryLabel.string += "+ Chọn " + this.topUpName + ". \n";
                this.detailFreeSummaryLabel.string += "+ Số lần quay: " + freeGameTotal + "\n";
            }
            //scatter win
            
            let freeWin = freeWinTotal;
            if (scatterAmount) {
                let {amtA1, amtA2, amtA} = scatterAmount;
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
});
