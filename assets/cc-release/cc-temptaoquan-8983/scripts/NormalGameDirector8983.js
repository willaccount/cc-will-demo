const BaseSlotGameDirector = require('SlotGameDirector');
const SILVER = 1;
cc.Class({
    extends: BaseSlotGameDirector,

    properties: {
        wildMultiplier: cc.Node
    },

    extendInit() {
        this.listExcuteNextScriptAsync = [];
    },

    _showEachPayLine(script) {
        const { isFinished } = this.node.gSlotDataStore.playSession;
        const { isAutoSpin } = this.node.gSlotDataStore;

        if (isFinished && !isAutoSpin) {
            const callback = () => {
                this.table.emit("SHOW_ALL_NORMAL_PAYLINES", () => {
                    this.runAsyncScript();
                });
            };
            this.listExcuteNextScriptAsync.push({ callback, isSkippable: true, name: "_showEachPayLine" });
            this.executeNextScript(script);
        } else {
            this.table.emit("SHOW_ALL_NORMAL_PAYLINES", () => {
                this.executeNextScript(script);
            });
        }
    },

    _blinkAllPaylines_2(script) {
        const { isFinished } = this.node.gSlotDataStore.playSession;
        const { isAutoSpin } = this.node.gSlotDataStore;
        if (isFinished && !isAutoSpin) {
            const callback = () => {
                this.table.emit("BLINK_ALL_NORMAL_PAYLINES", () => {
                    this.runAsyncScript();
                });
            };
            this.listExcuteNextScriptAsync.push({ callback, isSkippable: true, name: "_blinkAllPayline_2" });
            this.executeNextScript(script);
        } else {
            this._blinkAllPaylines(script);
        }
    },

    _spinClick(script) {
        this._super(script);
        this.wildMultiplier.emit('HIDE_MULTIPLIER');
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

    _hideCutScene(script, { name }) {
        if (this.node.mainDirector) {
            this.node.mainDirector.hideCutscene(name, () => {
                this.executeNextScript(script);
            });
        } else {
            cc.error('There is no main Director to play cutscenes');
            this.executeNextScript(script);
        }
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

    _resetSymbolPayline(script) {
        this.table.emit("RESET_SYMBOL_PAYLINES");
        this.executeNextScript(script);
    },

    _showWildPayline(script) {
        const { isFinished } = this.node.gSlotDataStore.playSession;
        const { isAutoSpin } = this.node.gSlotDataStore;

        if (isFinished && !isAutoSpin) {
            const callback = () => {
                this.table.emit('SHOW_WILD_PAYLINE', () => {
                    this.runAsyncScript();
                });
            };
            this.listExcuteNextScriptAsync.push({ callback, isSkippable: true, name: "_showWildPayline" });
            this.executeNextScript(script);
        } else {
            this.table.emit("SHOW_WILD_PAYLINE", () => {
                this.executeNextScript(script);
            });
        }
    },

    _showWildMultiplier(script, data) {
        const { content } = data;
        const { wildMultiplier, isFastToResult } = content;
        const { isFinished } = this.node.gSlotDataStore.playSession;
        const { isAutoSpin } = this.node.gSlotDataStore;

        if (isFinished && !isAutoSpin) {
            const callback = () => {
                if (isFastToResult) {
                    this.wildMultiplier.emit('ACTIVE_FAST', wildMultiplier, SILVER);
                    this.runAsyncScript();
                } else {
                    if (this.node.soundPlayer) {
                        this.node.soundPlayer.playMultiplier(wildMultiplier);
                    }
                    this.wildMultiplier.emit('ACTIVE_MULTIPLIER', wildMultiplier, SILVER, isAutoSpin, () => {
                        this.runAsyncScript();
                    });
                }
            };
            this.listExcuteNextScriptAsync.push({ callback, isSkippable: true, name: "_showWildMultiplier" });
            this.executeNextScript(script);
        } else {
            if (isFastToResult) {
                this.wildMultiplier.emit('ACTIVE_FAST', wildMultiplier, SILVER);
                this.executeNextScript(script);
            } else {
                if (this.node.soundPlayer) {
                    this.node.soundPlayer.playMultiplier(wildMultiplier);
                }
                this.wildMultiplier.emit('ACTIVE_MULTIPLIER', wildMultiplier, SILVER, isAutoSpin, () => {
                    this.executeNextScript(script);
                });
            }
        }
    },

    _updateValueJP(script, data) {
        this.node.mainDirector.updateValueJackpot(data.isGrand, data.value);
        this.executeNextScript(script);
    },

    _delayTimeScript(script, time) {
        const { isFinished } = this.node.gSlotDataStore.playSession;
        const { isAutoSpin } = this.node.gSlotDataStore;
        if (isFinished && !isAutoSpin) {
            const callback = () => {
                this.delayTimeCallback = () => {
                    this.delayTimeCallback = null;
                    this.runAsyncScript();
                };
                this.scheduleOnce(this.delayTimeCallback, time);
            };
            this.listExcuteNextScriptAsync.push({ callback, isSkippable: true, name: "_delayTimeScript" });
            this.executeNextScript(script);
        } else {
            this.delayTimeCallback = () => {
                this.delayTimeCallback = null;
                this.executeNextScript(script);
            };
            this.scheduleOnce(this.delayTimeCallback, time);
        }
    },

    _updateWinningAmount(script, { winAmount, time }) {
        const { isFinished } = this.node.gSlotDataStore.playSession;
        const { isAutoSpin } = this.node.gSlotDataStore;
        if (isFinished && !isAutoSpin) {
            const callback = () => {
                this.winAmount.emit("UPDATE_WIN_AMOUNT", { value: winAmount, time });
                this.runAsyncScript();
            };
            this.listExcuteNextScriptAsync.push({ callback, isSkippable: false, name: "_updateWinningAmount" });
            this.executeNextScript(script);
        } else {
            this.winAmount.emit("UPDATE_WIN_AMOUNT", { value: winAmount, time });
            this.executeNextScript(script);
        }
    },

    _resumeGameMode(script, {name, data}) {
        this._super(script, {name, data});

        if (this.node.soundPlayer) {
            this.node.soundPlayer.playMainBGM();
        }
    },

    _updateWinningAmountSync(script, { winAmount, time }) {
        this._canFastUpdateWinAmount = true;
        this._winValue = winAmount;
        const { isFinished } = this.node.gSlotDataStore.playSession;
        const { isAutoSpin } = this.node.gSlotDataStore;
        if (isFinished && !isAutoSpin) {
            const callback = () => {
                this.winAmount.emit("UPDATE_WIN_AMOUNT", { value: winAmount, time }, () => {
                    this._canFastUpdateWinAmount = false;
                    this._winValue = 0;
                });
                this.runAsyncScript();
            };
            this.listExcuteNextScriptAsync.push({ callback, isSkippable: false, name: "_updateWinningAmountSync" });
            this.executeNextScript(script);
        } else {
            this.winAmount.emit("UPDATE_WIN_AMOUNT", { value: winAmount, time }, () => {
                this._canFastUpdateWinAmount = false;
                this._winValue = 0;
            });
            this.executeNextScript(script);
        }
    },

    fastToResultClick() {
        this.skipAllEffects();
        this._super();
    },

    runAsyncScript() {
        if (this.isResetAsyncScript) return;
        const command = this.listExcuteNextScriptAsync.shift();
        if (command) {
            const { callback, name } = command;
            if (name) cc.log(this.name + ' run AsyncScript: ', name);
            callback && callback();
        }
    },

    _runAsyncScript(script) {
        this.runAsyncScript();
        this.executeNextScript(script);
    },

    resetAsyncScript() {
        if (!this.listExcuteNextScriptAsync) return;
        this.isResetAsyncScript = true;
        while (this.listExcuteNextScriptAsync.length > 0) {
            const command = this.listExcuteNextScriptAsync.shift();
            if (command) {
                const { callback, isSkippable, name } = command;
                if (!isSkippable) {
                    if (name) cc.log(this.name + ' run resetAsyncScript: ', name);
                    callback && callback();
                }
            }
        }
        this.isResetAsyncScript = false;
    },

    skipAllEffects() {
        this.resetAsyncScript();
        this.wildMultiplier.emit('ACTIVE_FAST');
        this._super();
        if (this.delayTimeCallback) {
            this.unschedule(this.delayTimeCallback);
            this.delayTimeCallback();
        }
    },
});