

cc.Class({
    extends: require("BaseDirectorV2"),

    properties: {
        table: cc.Node,
        winAmount: cc.Node,
        coundownText: cc.Label,
        max_open_items: 3,
        timerCount: 20,
        defaultValue: -1
    },
    onExtendedLoad() {
        this.node.on("GAME_UPDATE", this.stateUpdate, this);
        this.node.on("GAME_ENTER", this.onEnterGame, this);
        this.node.on("GAME_INIT", this.init, this);
        this.node.on('CLICK_ITEM', this.onClickItem, this);
        this.node.on("RUN_CONTINUE_SCRIPT",this.runContinueScript,this);
        this.node.on("FORCE_RESET_GAME_MODE", this.forceResetGameMode, this);
        this._resetStoreScript();
        this.node.listIdOpenItem = [];
    },
    /**
     * @receive_data*/
    stateUpdate(callback) {
        this.isWaitingResult = false;
        this.callbackStateUpdate = callback;
        this.runAction('ResultReceive');
    },
    init() {
        this.isWaitingResult = false;
        this.writer = this.node.writer;
        this.table.emit("INIT_TABLE");
        if (!this.winAmount)
            this.winAmount = this.node.mainDirector.gui.getWinAmount();
    },
    onEnterGame(data) {
        this.resetMiniGame();
        if (data) {
            this.table.emit("RESUME_MINI_GAME", data, this.defaultValue);
            for (let i = 0; i < data.length; i++) {
                if (data[i] !== this.defaultValue) {
                    this.node.listIdOpenItem.push(i + 1);
                }
            }
        }
        this.runAction("MiniGameStart");
        this.node.mainDirector.onIngameEvent("ENTER_GAME_MODE");
    },
    _miniGameStart(script) {
        this._runAutoTrigger(this.timerCount);
        this.executeNextScript(script);
    },
    _miniGameRestart(script) {
        this.executeNextScript(script);
    },
    onClickItem(e) {
        if (this.isWaitingResult) return;
        e.stopPropagation();
        this._stopAutoTrigger();
        if (this.node.listIdOpenItem.length < this.max_open_items) {
            let item = e.target;
            this.node.currentPick = item.itemId;
            this.node.listIdOpenItem.push(item.itemId);
            this.runAction("MiniGameClick");
            item.itemController.playAnimClick();
            item.itemController.disableClick();
            this.isAutoTrigger = e.getUserData().isAutoTrigger;
        }
    },

    _sendRequestPlayMiniGame(script, {openCell}) {
        this.isWaitingResult = true;
        this.node.mainDirector.gameStateManager.triggerMiniGame(openCell);
        this.executeNextScript(script);
    },
    _showResult(script) {
        this.isWaitingResult = false;
        this.runAction("ShowResult");
        this.executeNextScript(script);
    },
    _openPickedItem(script, data) {
        this.table.emit("OPEN_PICKED_ITEM", data, () => {
            this.executeNextScript(script);
        });
        if (this.node.listIdOpenItem.length < this.max_open_items) {
            const time = this.isAutoTrigger ? 0.5 : this.timerCount;
            this._runAutoTrigger(time);
        }
    },
    _openAllItems(script, matrix) {
        this._stopAutoTrigger();
        this.table.emit("OPEN_ALL_ITEMS", matrix, () => {
            this.executeNextScript(script);
        });
        this._stopRepeatCountDown();
    },

    _gameExit(script) {
        this.resetMiniGame();
        this.node.exit(() => {
            this.executeNextScript(script);
        });
    },

    _showCutscene(script, {name, content}) {
        if (this.node.mainDirector) {
            this.node.mainDirector.showCutscene(name, content, () => {
                this.executeNextScript(script);
            });
        } else {
            cc.error('There is no main Director to play cutscenes');
            this.executeNextScript(script);
        }
    },

    /** @WinAmount*/
    _updateLastWin(script, data) {
        if (data) {
            this.winAmount.emit("CHANGE_TO_LAST_WIN");
            this.node.mainDirector.updateWinAmountText({isWin: false});
        } else {
            this.winAmount.emit("CHANGE_TO_WIN");
            this.node.mainDirector.updateWinAmountText({isWin: true});
        }
        this.executeNextScript(script);
    },
    _updateWinningAmount(script, {winAmount, time}) {
        this.winAmount.emit("UPDATE_WIN_AMOUNT",{value: winAmount, time});
        this.executeNextScript(script);
    },
    _clearWinAmount(script) {
        this.winAmount.emit("RESET_NUMBER");
        this.executeNextScript(script);
    },

    resetMiniGame() {
        this._stopAutoTrigger();
        this._stopRepeatCountDown();
        this.node.listIdOpenItem = [];
        this.node.currentPick = 0;
        this.table.emit("RESET_MINI_TABLE");
        this._count = this.timerCount;
        if (this.coundownText) {
            this.coundownText.node.opacity = 0;
        }
    },

    _runAutoTrigger(delay) {
        this._stopAutoTrigger();
        this.autoTriggerMinigame = cc.sequence(
            cc.delayTime(delay),
            cc.callFunc(() => {
                this.table.emit("AUTO_OPEN_BOX");
            })
        );
        if (this.node) this.node.runAction(this.autoTriggerMinigame);
        this._updateCownDownText(delay);
    },

    _stopAutoTrigger() {
        if (this.autoTriggerMinigame && this.autoTriggerMinigame.target) {
            this.node.stopAction(this.autoTriggerMinigame);
        }
    },

    runContinueScript() {
        const {data, script} = this.storeNextScripts;
        this[this.storeCurrentScripts] && this[this.storeCurrentScripts](script, data);
        this._resetStoreScript();
    },

    _resetStoreScript() {
        this.storeCurrentScripts = '';
        this.storeNextScripts = {
            script: [],
            data: {}
        };
    },

    _updateCownDownText(delay) {
        if (!this.coundownText) return;
        this._stopRepeatCountDown();
        if (delay === this.timerCount) {
            this.repeatCountDown = cc.repeatForever(
                cc.sequence(
                    cc.callFunc(() => {
                        this.coundownText.node.opacity = 255;
                        this.coundownText.string = `Hệ thống sẽ tự chọn sau: ${this._count}s`;
                    }),
                    cc.delayTime(1),
                    cc.callFunc(() => {
                        this._count--;
                        if (this._count <= 0) {
                            this.node.stopAction(this.repeatCountDown);
                        }
                    })
                ));
            this.node.runAction(this.repeatCountDown);
        } else {
            this.coundownText.node.opacity = 0;
        }
    },

    _stopRepeatCountDown() {
        if (this.repeatCountDown && this.repeatCountDown.target) {
            this.node.stopAction(this.repeatCountDown);
            this._count = this.timerCount;
            this.coundownText.node.opacity = 0;
        }
    },

    forceStopSpinning() {

    },

    stopAutoSpinClick() {

    },

    forceResetGameMode(gameMode) {
        this.isSkipAllScrips = true;
        if (gameMode === 'bonusGame') {
            this.forceResetBonusGame();
        }
    },

    forceResetBonusGame() {
        this.node.resetCallbackWhenHide();
        this.scheduleOnce(() => {
            this.isSkipAllScrips = false;
            this.node.exit(() => {});
        }, 1);
    },

    onDestroy() {
        if (this.repeatCountDown) this.node.stopAction(this.repeatCountDown);
    },
});
