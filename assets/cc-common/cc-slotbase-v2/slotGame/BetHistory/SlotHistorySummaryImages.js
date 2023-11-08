const {formatMoney} = require('utils');
const arrayTypeJackpot = ["MINI","MINOR","MAJOR","GRAND"];

cc.Class({
    extends: cc.Component,

    properties: {
        scrollView : cc.ScrollView,
        sessionLabel : cc.Label,
        totalWinLabel: cc.Label,
        totalWinNormal: cc.Node,
        totalJackpotAllModes: cc.Node,
        totalWinFree: cc.Node,
        totalWinTopUp: cc.Node,
        totalWinFreeAllModes : cc.Node
    },

    onLoad () {
        this.node.on('DISPLAY_DATA', this.updateData, this);
        this.node.on('CLEAR_TOTAL_DETAIL_DATA', this.resetLabelTotalDetail, this);
    },

    resetLabelTotalDetail() {
        this.scrollView.scrollToTop();
        this.totalWinLabel.string  = this.getWinMoney(0);
        this.totalWinNormal.emit("RESET_DATA");
        this.totalJackpotAllModes.emit("RESET_DATA");
        this.totalWinFree.emit("RESET_DATA");
        this.totalWinTopUp.emit("RESET_DATA");
        this.totalWinFreeAllModes.emit("RESET_DATA");
        
        this.totalWinFree.active = false;
        this.totalWinTopUp.active = false;
        this.totalWinFreeAllModes.active = true;
        this.totalJackpotAllModes.active = true;
    },

    getWinMoney(money = 0){
        return formatMoney(money);
    },

    updateData(data) {
        this.node.opacity = 0;
        this.resetLabelTotalDetail();
        console.warn("response summary " + JSON.stringify(data));
        let { sessionId, totalWinAmount, freeSummary,
            totalFreeWinAmount, totalJpWinAmount, jpInfo } = data;

        this.initAllJackpot(jpInfo);

        sessionId = data.sessionId.substring(data.sessionId.length - 8, data.sessionId.length);

        let normalWin = totalWinAmount - (totalFreeWinAmount || 0) - (totalJpWinAmount || 0);
        
        this.totalWinLabel.string = this.getWinMoney(totalWinAmount);

        this.sessionLabel.node.active = true;
        this.sessionLabel.string = `#${sessionId}`;
     
        this.totalWinNormal.emit("UPDATE_WIN", normalWin);

        if (this.jackpotBonus) {
            this.updateWinJackpot(this.jackpotBonus.amt);
        }

        if (this.jackpotNormal){
            this.updateWinJackpot(this.jackpotNormal.amt);
        }

        if (freeSummary && freeSummary.length > 0) {
            this.totalWinFreeAllModes.active = false;
            freeSummary.forEach(it=>{
                if(it.selectOption == 1) {
                    this.totalWinFree.emit("UPDATE_WIN", it.winAmount);
                    this.totalWinFree.active = it.winAmount > 0;
                } else if (it.selectOption == 2){
                    this.totalWinTopUp.emit("UPDATE_WIN", it.winAmount);
                    this.totalWinTopUp.active = it.winAmount > 0;
                }
            });
        }

        if (this.jackpotFreeList && this.jackpotFreeList.length > 0) {
            for (let i = 0; i < this.jackpotFreeList.length; i++) {
                this.updateWinJackpot(this.jackpotFreeList[i].amt);
            }
        }

        this.node.opacity = 1;
        this.scheduleOnce(() =>{
            this.node.opacity = 255;
        }, 0.02);
    },

    updateWinJackpot(winAmount = 0){
        this.totalJackpotAllModes.active = true;
        this.totalJackpotAllModes.emit("UPDATE_WIN", winAmount);
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
