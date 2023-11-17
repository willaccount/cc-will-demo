const SlotGameDirector = require('SlotGameDirector');
cc.Class({
    extends: SlotGameDirector,

    ready(data) {
        let { optionResult } = this.node.gSlotDataStore.lastEvent;
        this.table.active = true;
        if (data && data.matrix) {
            this.table.emit("CHANGE_MATRIX", { matrix: data.matrix });
        }
        if(data && data.optionResult) {
            this.updateWildType(data.optionResult);
        } else if(optionResult) {
            this.updateWildType(optionResult.spinAmountIndex);
        }

        const { winAmount, freeGameRemain } = this.node.gSlotDataStore.playSession;
        if (!winAmount || (winAmount && winAmount == 0)) {
            this.winAmount.emit("RESET_NUMBER");
        }

        this.node.gSlotDataStore.isAutoSpin = true;
        this.spinTimes.emit("UPDATE_SPINTIMES", freeGameRemain);
    },

    updateWildType(type) {
        this.table.emit("SET_WILD_TYPE", type);
    },
});
