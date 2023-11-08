const { formatMoney } = require('utils');

cc.Class({
    extends: require("BaseCellHistory"),

    properties: {
        session: cc.Node,
        betDenom: cc.Node,
        betLines: cc.Node,
        totalbet: cc.Node,
        detailBtn: cc.Node,
        featureGroup: cc.Node,
        
        freeCircle: cc.Node,        //yellow
        bonusCircle: cc.Node,       //blue
        topUpCircle: cc.Node,       //green 
        jackpotCircle: cc.Node,     //red
        positionCircles: [cc.Node],
    },

    onLoad() {
        this._super();
        if (this.node.config.PAY_LINE_ALLWAYS) {
            if (JSON.stringify(this.node.config.TABLE_FORMAT) === "[3,3,3,3,3]")
                this.totalLineCount = '243';
            else
                this.totalLineCount = 'All ways';
        }
        if (this.freeCircle) this.freeCircle.active = false;
        if (this.bonusCircle) this.bonusCircle.active = false;
        if (this.topUpCircle) this.topUpCircle.active = false;
        if (this.jackpotCircle) this.jackpotCircle.active = false;
    },

    updateData(data) {
        this.detailBtn.active = false;

        if (!data) return;
        this.playSessionId = data.sessionId;
        this.session.getComponent(cc.Label).string = "#" + data.sessionId.substring(data.sessionId.length-8, data.sessionId.length);
        this.time.getComponent(cc.Label).string = this.formatTimeStamp(parseInt(data.time));
        if(this.betDenom)this.betDenom.getComponent(cc.Label).string = Number(data.betDenom);
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
        if(this.featureGroup){
            this.freeCircle.active = data.freeGameTotal > 0;
            this.bonusCircle.active = data.totalBonusWinAmount > 0;
        }
        this.addCircle(data);
    },

    onClickDetail() {
        if (this.node.opacity < 255) return; 
        this.clickItemEvent = new cc.Event.EventCustom('OPEN_BET_DETAIL', true);
        this.clickItemEvent.setUserData({
            sessionId: this.playSessionId,
            summaryData: this.dataDetail,
        });
        this.node.dispatchEvent(this.clickItemEvent);
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
    },

    addCircle(data) {
        if (!data) return;
        let listMode = [];
        if (this.freeCircle) this.freeCircle.active = false;
        if (this.bonusCircle) this.bonusCircle.active = false;
        if (this.topUpCircle) this.topUpCircle.active = false;
        if (this.jackpotCircle) this.jackpotCircle.active = false;

        const { freeGameTotal, totalJpWinAmount, totalBonusWinAmount } = data;

        if (totalJpWinAmount && totalJpWinAmount > 0 && this.jackpotCircle) {
            this.jackpotCircle.active = true;
            listMode.push(this.jackpotCircle);
        }
        if (totalBonusWinAmount && totalBonusWinAmount > 0 && this.bonusCircle) {
            this.bonusCircle.active = true;
            listMode.push(this.bonusCircle);
        }

        if (freeGameTotal && this.freeCircle) {
            this.freeCircle.active = true;
            listMode.push(this.freeCircle);
        }

        if (listMode.length > 0 && this.positionCircles.length > 0) {
            listMode.forEach((item, index) => {
                const position = this.positionCircles[index].position;
                item.setPosition(position);
            });
        }
    }
});

