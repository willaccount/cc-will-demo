const { formatMoney } = require('utils');
const { formatUserName } = require('utils');

function addZero(i) {
    if (i < 10) {
        i = '0' + i;
    }
    return i;
}

cc.Class({
    extends: cc.Component,

    properties: {
        time: cc.Node,
        account: cc.Node,
        bet: cc.Node,
        winAmount: cc.Node,
        timeFormat: "DD/MM hh:mm:ss"
    },

    onLoad() {
        this.node.updateData = this.updateData.bind(this);
    },

    updateData(data) {
        if (!data) return;
        this.time.getComponent(cc.Label).string = this.formatTimeStamp(data.time);
        this.account.getComponent(cc.Label).string = formatUserName(data.dn);
        this.bet.getComponent(cc.Label).string = formatMoney(data.betAmt);
        this.winAmount.getComponent(cc.Label).string = formatMoney(data.jpAmt);
    },


    formatTimeStamp(ts) {
        const date = new Date(ts);
        let time = '';

        let year = date.getFullYear();
        let month = addZero(date.getMonth() + 1);
        let day = addZero(date.getDate());

        let hours = addZero(date.getHours());
        let minutes = addZero(date.getMinutes());
        let seconds = addZero(date.getSeconds());

        if (this.timeFormat) {
            time = this.timeFormat.replace('YYYY', year)
                .replace('MM', month)
                .replace('DD', day)
                .replace('hh', hours)
                .replace('mm', minutes)
                .replace('ss', seconds);
        } else {
            time = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        }
        return time;
    }

});
