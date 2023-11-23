const SlotGameDirector = require('SlotGameDirector');
const lodash = require('lodash');
const COL_FOURTH = 4;

cc.Class({
    extends: SlotGameDirector,

    properties: {
        symbolPrefab: cc.Prefab,
        wildMultiplier: cc.Node
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

    _spinClick(script) {
        this._super(script);
        this.wildMultiplier.emit('HIDE_MULTIPLIER');
    },

    _showEachPayLine(script) {
        this.table.emit("SHOW_ALL_FREE_PAYLINES");
        this.executeNextScript(script);
    },

    _resultReceive(script, data) {
        if (!this.fsm.can('resultReceive')) return;
        this.fsm.resultReceive();
        this.buttons.emit('FAST_TO_RESULT_ENABLE');
        this.buttons.emit('ENABLE_PROMOTION_STOP_SPIN');
        if (this.node.mainDirector.trialMode && this.node.gSlotDataStore.currentGameMode !== "normalGame") {
            this._showTrialButtons(null, true);
        }
        if (!this.hasTable) {
            this.executeNextScript(script);
            return;
        }
        this.table.emit("CONVERT_SUB_SYMBOLS_INDEX", data);
        this.table.emit("STOP_SPINNING", data, () => {
            this.node.mainDirector.onIngameEvent("SPIN_STOPPED");
            this.isStopRunning = true;
            this.executeNextScript(script);
        });
    },

    _showSmallSubSymbols(script) {
        this.table.emit("SHOW_SMALL_SUB_SYMBOLS");
        this.executeNextScript(script);
    },

    _showFreeSymbolPayLine(script,payLines) {
        if (!this.hasPayline) {
            this.executeNextScript(script);
            return;
        }
        this.table.emit("BLINK_ALL_NORMAL_PAYLINES",() => {
            this.table.emit("SHOW_ALL_FREE_PAYLINES",payLines);
            this.executeNextScript(script);
        });
    },

    _showWildPayline(script, { name, content}) {
        this.table.emit("SHOW_WILD_PAYLINE",() => {
            this._showWildMultiplier(script, content);
        });
    },

    _showWildMultiplier(script, content ) {
        const color = 7;
        const { wildMultiplier } = content;
        const { isAutoSpin } = this.node.gSlotDataStore;

        this.wildMultiplier.emit('ACTIVE_MULTIPLIER', wildMultiplier, color, isAutoSpin, () => {
            this.executeNextScript(script);
        });
    },
});
