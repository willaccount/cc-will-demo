const BaseSlotGameDirector = require('SlotGameDirector');
cc.Class({
    extends: BaseSlotGameDirector,

    properties: {
        wildMultiplier: cc.Node
    },

    _showWildMultiplier(script, { name, content }) {
        const color = 7;
        const { isFinished } = this.node.gSlotDataStore.playSession;
        const { isAutoSpin } = this.node.gSlotDataStore;

        this.wildMultiplier.emit('ACTIVE_MULTIPLIER', content.nwm, color, isAutoSpin, () => {
            this.executeNextScript(script);
        });
    },

    _showEachPayLine(script) {
        this.table.emit("SHOW_ALL_NORMAL_PAYLINES");
        this.executeNextScript(script);
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
        //Check if we have table to show or not.... or should we use base interface????
        //Anyways,... I can decoupling table from game mode, thats good enough for v2
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
        this.table.emit("SHOW_SUB_SYMBOL_ANIMS", subSymbols);
        this.executeNextScript(script);
    },
});