const BaseSlotGameDirector = require('SlotGameDirector');
cc.Class({
    extends: BaseSlotGameDirector,
    properties: {
        wildMultiplier: cc.Node
    },

    extendInit() {
        this.listExcuteNextScriptAsync = [];
    },

    forceStopSpinning() {
        this.table.emit("HIDE_SUB_SYMBOL_PAYLINE");
        this._super();
    },

    _spinClick(script) {
        this._super(script);
        this.wildMultiplier.emit('HIDE');
    },

    _disableBet(script) {
        this.node.mainDirector.gui.emit('BET_DISABLE');
        this.executeNextScript(script);
    },
    _enableBet(script) {
        this.node.mainDirector.gui.emit('BET_ENABLE');
        this.executeNextScript(script);
    },

    _showSoundWinAnimation(script, data) {
        const { currentBetData, winAmount } = data;
        const { gameSpeed } = this.node.gSlotDataStore;
        const isFTR = gameSpeed === this.node.config.GAME_SPEED.INSTANTLY;
        if (data && this.node.soundPlayer && !isFTR) {
            if (winAmount >= currentBetData * 5 && winAmount < currentBetData * 10) {
                this.node.soundPlayer.playSFXWinLine(3);
            } else if (winAmount >= currentBetData && winAmount < currentBetData * 5) {
                this.node.soundPlayer.playSFXWinLine(2);
            } else if (winAmount > 0 && winAmount < currentBetData) {
                this.node.soundPlayer.playSFXWinLine(1);
            }
        }
        this.executeNextScript(script);
    },
    _gameRestart(script) {
        this.node.isFastToResult = 0;
        this._super(script);
    },
    _showScatterPayLine(script) {
        // if (this.node.soundPlayer) this.node.soundPlayer.playSFXScatterWin();
        this._super(script);
    },
    _playSFXLenChau(script) {
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXLenChau();
        this.executeNextScript(script);
    },
    _playSFXLenChau_2(script) {
        this.executeNextScript(script);
    },
    _playSFXCloud1(script) {
        this.node.soundPlayer.stopAllAudio();
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXCloud1();
        this.executeNextScript(script);
    },
    _playSFXCloud1_2(script) {
        this.executeNextScript(script);
    },
    _playSFXCloud2(script) {
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXCloud2();
        this.executeNextScript(script);
    },
    _playSFXCloud2_2(script) {
        this.executeNextScript(script);
    },
    _resumeGameMode(script, { name, data }) {
        if (this.node.mainDirector) {
            this.node.mainDirector.resumeGameMode({ name, data }, () => {
                //if (this.node.soundPlayer) this.node.soundPlayer.stopAllAudio();
                if (this.node.soundPlayer) this.node.soundPlayer.playMainBGM();
                this.executeNextScript(script);
            });
        } else {
            cc.error('There is no main Director to resume game mode');
            this.executeNextScript(script);
        }
        if (!this._autoSpin) {
            this.buttons.emit('SPIN_SHOW');
            this.buttons.emit('SPIN_ENABLE');
            this.buttons.emit('FAST_TO_RESULT_HIDE');
            this.buttons.emit('STOP_AUTO_SPIN_HIDE', true);
        }
    },

    _newGameMode(script, { name, data }) {
        if (this.node.mainDirector) {
            this.node.soundPlayer.stopAllAudio();
            if (this.node.soundPlayer) this.node.soundPlayer.playSFXCloud1();
            this.node.mainDirector.showCutscene('IntroFreeGame', {}, () => {
                this.node.mainDirector.newGameMode({ name, data }, () => {
                    this.executeNextScript(script);
                });
            });
        } else {
            cc.error('There is no main Director to new game mode');
            this.executeNextScript(script);
        }
    },

    _showAllPayLine(script) {
        this.table.emit("BLINK_ALL_NORMAL_PAYLINES", () => { });
        this.executeNextScript(script);
    },

    _showAllPayLineSync(script) {
        const { isFinished } = this.node.gSlotDataStore.playSession;
        const { isAutoSpin } = this.node.gSlotDataStore;
        if (isFinished && !isAutoSpin) {
            const callback = () => {
                this.table.emit("BLINK_ALL_NORMAL_PAYLINES", () => {
                    this.runAsyncScript();
                });
            };
            this.listExcuteNextScriptAsync.push({ callback, isSkippable: true, name: "_showAllPayLineSync" });
            this.executeNextScript(script);
        } else {
            this.table.emit("BLINK_ALL_NORMAL_PAYLINES", () => {
                this.executeNextScript(script);
            });
        }
    },

    _showEachPayLine(script) {
        const { isFinished } = this.node.gSlotDataStore.playSession;
        const { isAutoSpin } = this.node.gSlotDataStore;
        if (isFinished && !isAutoSpin) {
            const callback = () => {
                this.table.emit("SHOW_ALL_NORMAL_PAYLINES");
                this.runAsyncScript();
            };
            this.listExcuteNextScriptAsync.push({ callback, isSkippable: true, name: "_showEachPayLine" });
            this.executeNextScript(script);
        } else {
            this.table.emit("SHOW_ALL_NORMAL_PAYLINES");
            this.executeNextScript(script);
        }
    },

    _showAllPayLine_2(script) {
        this.executeNextScript(script);
    },

    _showAllPayLineSync_2(script) {
        this.executeNextScript(script);
    },

    // _showEachPayLine_2(script) {
    //     this.table.emit("HIDE_PAYLINES");
    //     this.executeNextScript(script);
    // },

    _showFreeGameOption(script, { name, content }) {
        if (this.node.mainDirector) {
            this.node.mainDirector.showCutscene(name, content, () => {
                this.executeNextScript(script);
            });
        } else {
            cc.error('There is no main Director to play cutscenes');
            this.executeNextScript(script);
        }
    },

    _hideCutscene(script, { name }) {
        if (this.node.mainDirector) {
            this.node.mainDirector.hideCutscene(name, () => {
                this.executeNextScript(script);
            });
        } else {
            cc.error('There is no main Director to play cutscenes');
            this.executeNextScript(script);
        }
    },

    _showSubSymbolPayLine(script, data) {
        if (!this.hasPayline) {
            this.executeNextScript(script);
            return;
        }
        this.table.emit("SHOW_SUB_SYMBOL_PAYLINE", data, () => {
            this.executeNextScript(script);
        });
    },

    _hideSubSymbolPayLine(script) {
        this.table.emit("HIDE_SUB_SYMBOL_PAYLINE");
        this.executeNextScript(script);
    },

    _showSubSymbolPayLine_2(script) {
        this.executeNextScript(script);
    },

    _updateValueJP(script, data) {
        this.node.mainDirector.updateValueJackpot(data.isGrand, data.value);
        this.executeNextScript(script);
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

    _showEachPayLineSync(script) {
        const { isFinished } = this.node.gSlotDataStore.playSession;
        const { isAutoSpin } = this.node.gSlotDataStore;
        if (isFinished && !isAutoSpin) {
            const callback = () => {
                this.table.emit("SHOW_ALL_NORMAL_PAYLINES", () => {
                    this.runAsyncScript();
                });
            };
            this.listExcuteNextScriptAsync.push({ callback, isSkippable: true, name: "_showEachPayLineSync" });
            this.executeNextScript(script);
        } else {
            this.table.emit("SHOW_ALL_NORMAL_PAYLINES", () => {
                this.executeNextScript(script);
            });
        }
    },
    // _showEachPayLineSync_2(script) {
    //     this.table.emit("HIDE_PAYLINES");
    //     this.executeNextScript(script);
    // },

    autoSpinClick() {
        if (!this.node || !this.node.director || !this.node.director.fsm ||
            !this.node.director.fsm.can('actionTrigger') || !this.node.mainDirector.readyToPlay) return;
        this.buttons.emit("AUTO_SPIN_CLICK");
    },

    multiSpin4Click() {
        this._super();
        this.node.mainDirector.gui.emit('BET_DISABLE');
    },

    _clearWinAmount(script) {
        this.winAmount.emit("FADE_OUT_NUMBER", this.node.gSlotDataStore.modeTurbo ? 0.3 : 0.6);
        this.executeNextScript(script);
    },

    fastToResultClick() {
        this.skipAllEffects();
        this._super();
    },

    spinClick() {
        if (this._canFastUpdateWinAmount && this._winValue > 0) {
            this._callbackUpdateWinAmount = null;
            this._canFastUpdateWinAmount = false;
            this.winAmount.emit("FAST_UPDATE_WIN_AMOUNT", { value: this._winValue, time: 0 });
        }
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

    _runAsyncScript(script) {
        this.executeNextScript(script);
        this.runAsyncScript();
    },

    skipAllEffects() {
        this.resetAsyncScript();
        this.wildMultiplier.emit('SHOW_LAST_RESULT');
        this._super();
        if (this.delayTimeCallback) {
            this.unschedule(this.delayTimeCallback);
            this.delayTimeCallback();
        }
    },

    _showWinEffect(script, { name, content }) {
        const { isFinished } = this.node.gSlotDataStore.playSession;
        const { isAutoSpin } = this.node.gSlotDataStore;
        if (isFinished && !isAutoSpin) {
            const callback = () => {
                if (this.node.mainDirector) {
                    this.node.mainDirector.showCutscene(name, content, () => {
                        this.runAsyncScript();
                    });
                } else {
                    cc.error('There is no main Director to play cutscenes');
                    this.runAsyncScript();
                }
            };
            this.listExcuteNextScriptAsync.push({ callback, isSkippable: true, name: "_showWinEffect" });
            this.executeNextScript(script);
        } else {
            if (this.node.mainDirector) {
                this.node.mainDirector.showCutscene(name, content, () => {
                    this.executeNextScript(script);
                });
            } else {
                cc.error('There is no main Director to play cutscenes');
                this.executeNextScript(script);
            }
        }
    },

    _showWinEffect_2(script) {
        this.executeNextScript(script);
    },

    _animMultiplierWild(script) {
        this.executeNextScript(script);
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

    _showWildTransition(script, { name, content }) {
        const color = 7;
        const { isFinished } = this.node.gSlotDataStore.playSession;
        const { isAutoSpin } = this.node.gSlotDataStore;
        if (isFinished && !isAutoSpin) {
            const callback = () => {
                if (this.node.mainDirector) {
                    this.node.mainDirector.showCutscene(name, content, (isSkip) => {
                        if (isSkip) {
                            this.wildMultiplier.emit('ACTIVE_FAST', content.nwm, color);
                            this.runAsyncScript();
                        } else {
                            if (this.node.soundPlayer) this.node.soundPlayer.playMultiplier(content.nwm);
                            this.wildMultiplier.emit('ACTIVE_MULTIPLIER', content.nwm, color, false, () => {
                                this.runAsyncScript();
                            });
                        }
                    });
                }
            };
            this.listExcuteNextScriptAsync.push({ callback, isSkippable: true, name: "_showWildTransition" });
            this.executeNextScript(script);
        } else {
            this.node.mainDirector.showCutscene(name, content, (isSkip) => {
                if (isSkip) {
                    this.wildMultiplier.emit('ACTIVE_FAST', content.nwm, color);
                    this.executeNextScript(script);
                } else {
                    if (this.node.soundPlayer) this.node.soundPlayer.playMultiplier(content.nwm);
                    this.wildMultiplier.emit('ACTIVE_MULTIPLIER', content.nwm, color, isAutoSpin, () => {
                        this.executeNextScript(script);
                    });
                }
            });
        }
    },

    _showWildTransition_2(script, { content }) {
        const color = 7;
        this.wildMultiplier.emit('ACTIVE_FAST', content.nwm, color);
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

    _pauseWallet(script) {
        this.node.gSlotDataStore.isUpdateWinAmount = true;
        this.executeNextScript(script);
    },

    _resumeWallet(script) {
        this.node.gSlotDataStore.isUpdateWinAmount = false;
        this.executeNextScript(script);
    },

    _resumeMultiply(script, multiply) {
        const color = 7;
        this.wildMultiplier.emit('ACTIVE_FAST', multiply, color);
        this.executeNextScript(script);
    }
});
