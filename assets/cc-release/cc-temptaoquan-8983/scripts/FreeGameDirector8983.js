const SlotGameDirector = require('SlotGameDirector');
const lodash = require('lodash');
const COL_FOURTH = 4;

cc.Class({
    extends: SlotGameDirector,

    properties: {
        symbolPrefab: cc.Prefab,
        wildMultiplier: cc.Node,
        optionRemain: cc.Node,
    },

    ready(data) {
        const { isResume, freeSpinMatrix, freeSpinOptionRemain } = data;
        const { winAmount, freeGameRemain } = this.node.gSlotDataStore.playSession;
        const { fgoi: freeGameOptionID } = this.node.gSlotDataStore.playSession.extend;
        const hasFreegame = freeGameRemain && freeGameRemain > 0;

        if (this.node.soundPlayer) {
            this.node.soundPlayer.playMainBGM();
        }

        if (isResume && !hasFreegame && freeGameOptionID) {
            this.updateWildType(freeGameOptionID);
            this.scheduleOnce(() => {
                this.runAction('Resume');
            }, 1);
            return;
        }

        this.table.active = true;
        this.gameConfig = this.node.config;
        if (data && freeSpinMatrix) {
            let freeGameMatrix = this.addingFreeGameSymbols(freeSpinMatrix);
            this.table.emit("CHANGE_MATRIX", { matrix: freeGameMatrix });
        }
        if (data && freeGameOptionID) {
            this.updateWildType(freeGameOptionID);
        }
        if(freeSpinOptionRemain) {
            this.updateOptionRemain(freeSpinOptionRemain);
        }
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
        for (let col = 1; col < COL_FOURTH; ++col) {
            this.symbolList = this.gameConfig.SYMBOL_NAME_LIST_FREE[col];
            newMatrix[col].unshift(this.getRandomSymbolName());
        }
        return newMatrix;
    },

    getRandomSymbolName() {
        return this.symbolList[Math.floor(Math.random() * this.symbolList.length)];
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

    _showFreeSymbolPayLine(script, payLines) {
        if (!this.hasPayline) {
            this.executeNextScript(script);
            return;
        }
        this.table.emit("BLINK_ALL_NORMAL_PAYLINES", () => {
            this.table.emit("SHOW_ALL_FREE_PAYLINES", payLines);
            this.executeNextScript(script);
        });
    },

    _setUpPaylines(script, { matrix, payLines }) {
        this.hasPayline = true;
        this.table.emit("SETUP_PAYLINES", matrix, payLines);
        this.executeNextScript(script);
    },

    _showJackpotPayLine(script, subSymbols) {
        if (!this.hasPayline) {
            this.executeNextScript(script);
            return;
        }
        this.table.emit("SHOW_SUB_SYMBOL_ANIMS", subSymbols, () => {
            this.executeNextScript(script);
        });
    },

    _showWildPayline(script, data) {
        const { freeGameOptionID } = data;
        this.table.emit("SHOW_WILD_PAYLINE", freeGameOptionID, () => {
            this.executeNextScript(script);
        });
    },

    _showWildMultiplier(script, data ) {
        const color = 1;
        const { content } = data;
        const { wildMultiplier, freeGameOptionID } = content;
        const { isAutoSpin } = this.node.gSlotDataStore;

        if (this.node.soundPlayer) {
            this.node.soundPlayer.playMultiplier(wildMultiplier);
        }
        this.wildMultiplier.emit('ACTIVE_MULTIPLIER', wildMultiplier, freeGameOptionID, isAutoSpin, () => {
            this.executeNextScript(script);
        });
    },

    _resetSymbolPayline(script) {
        this.table.emit("RESET_SYMBOL_PAYLINES");
        this.executeNextScript(script);
    },

    _showResultFreeGameOption(script, data) {
        const { name, content } = data;
        if (this.node.mainDirector) {
            this.node.mainDirector.showCutscene(name, content, () => {
                this.executeNextScript(script);
            });
        } else {
            cc.error('There is no main Director to play cutscenes');
            this.executeNextScript(script);
        }
    },

    _updateSpinTimeFreeGameOption(script) {
        const { optionResult } = this.node.gSlotDataStore.lastEvent;
        this.node.gSlotDataStore.isAutoSpin = true;

        if (optionResult) {
            const { spinAmount } = optionResult;
            this.spinTimes.emit("UPDATE_SPINTIMES", Number(spinAmount));
        }
        this.executeNextScript(script);
    },

    _updateValueJP(script, data) {
        this.node.mainDirector.updateValueJackpot(data.isGrand, data.value);
        this.executeNextScript(script);
    },

    _forceState(script) {
        // this.fsm.gameRestart();
        this.fsm.gameResume();
        this.executeNextScript(script);
    },

    updateOptionRemain(data) {
        if(data && data != 0) {
            this.optionRemain.parent.active = true;
            this.optionRemain.getComponent(cc.Label).string = '+'+data;
        } else {
            this.optionRemain.parent.active = false;
        }
    },

    _updateOptionRemain(script, data) {
        this.updateOptionRemain(data);
        this.executeNextScript(script);
    },
});
