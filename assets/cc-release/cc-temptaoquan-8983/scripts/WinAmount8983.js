const { formatMoney } = require("utils");
const lodash = require('lodash');

cc.Class({
    extends: require("WinAmount"),
    
    updateBgToWin() {
        if (this.bg.getComponent(cc.Label)) {
            this.bg.getComponent(cc.Label).string = this.textWin;
        }
    },
    updateBgToLastWin() {
        if (this.bg.getComponent(cc.Label)) {
            this.bg.getComponent(cc.Label).string = this.textLastWin;
        }
    }
});
