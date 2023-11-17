const SlotGameDirector = require('SlotGameDirector');
const lodash = require('lodash');
const COL_FOURTH = 4;

cc.Class({
    extends: SlotGameDirector,

    properties: {
        symbolPrefab: cc.Prefab,
    },

    ready(data) {
        let { optionResult } = this.node.gSlotDataStore.lastEvent;
        this.table.active = true;
        this.gameConfig = this.node.config;
        if (data && data.matrix) {
            let freeGameMatrix = this.addingFreeGameSymbols(data.matrix);
            this.table.emit("CHANGE_MATRIX", { matrix: freeGameMatrix });
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
        this.scheduleOnce(() => {
            this.runAction('SpinByTimes', freeGameRemain);
        }, 1);
    },

    updateWildType(type) {
        this.table.emit("SET_WILD_TYPE", type);
    },

    addingFreeGameSymbols(matrix) {
        let newMatrix = matrix;
        for(let col = 1; col < COL_FOURTH; ++col) {
            this.symbolList = this.gameConfig.SYMBOL_NAME_LIST_FREE[col];
            newMatrix[col].unshift(this.getRandomSymbolName());
        }
        return newMatrix;
    },

    getRandomSymbolName() {
        return this.symbolList[Math.floor(Math.random()*this.symbolList.length)];
    },
});
