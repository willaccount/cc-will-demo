cc.Class({
    extends: require('Director'),



    initGameMode() {
        //Binding game modes
        if (this.normalGame) this.normalGame.init(this, true);
        if (this.freeGame) this.freeGame.init(this);

        //2 modes: normalGame, freeGame
        this.node.gSlotDataStore.currentGameMode = "normalGame";
        this.currentGameMode = this[this.node.gSlotDataStore.currentGameMode];

        this.gui.emit('SHOW_GUI_NORMAL_GAME_MODE');
        this.currentGameMode.enter();
    },

    extendActionForResume() {
        this.normalGame.emit("AUTO_SPIN_DISABLE");
    },

    hideCutscene(name, callback) {
        this.cutscene.emit("CLOSE_CUTSCENE", name, callback);
    },

    newGameMode({ name, data }, callback) {
        if (this[name]) {
            this.currentGameMode.hide();
            this.node.gSlotDataStore.currentGameMode = name;
            this.currentGameMode = this[this.node.gSlotDataStore.currentGameMode];
            switch (name) {
                case 'normalGame':
                    this.gui.emit('SHOW_GUI_NORMAL_GAME_MODE');
                    break;
                case 'freeGame':
                    this.gui.emit('SHOW_GUI_FREE_GAME_MODE');
                    break;
            }
            this.resetGameSpeed();
            this.currentGameMode.enter(data, callback);
        }
    },
    resumeGameMode({ name }, callback) {
        if (this[name]) {
            this.node.gSlotDataStore.currentGameMode = name;
            this.currentGameMode = this[this.node.gSlotDataStore.currentGameMode];
            switch (name) {
                case 'normalGame':
                    this.gui.emit('SHOW_GUI_NORMAL_GAME_MODE');
                    break;
                case 'freeGame':
                    this.gui.emit('SHOW_GUI_FREE_GAME_MODE');
                    break;
            }
            this.resetGameSpeed();
            this.currentGameMode.show(callback);
        }
    },

    resetGameSpeed() {
        if (this.currentGameMode.director && this.currentGameMode.director.resetGameSpeed) {
            this.currentGameMode.director.resetGameSpeed();
        }
    },

    pauseJackpot() {
        this.jackpot.emit("PAUSE_JACKPOT");
    },
    resumeJackpot() {
        this.jackpot.emit("RESUME_JACKPOT");
    },
    updateValueJackpot(isGrand = true, value = 0) {
        this.jackpot.emit("UPDATE_VALUE_JACKPOT", isGrand, value);
    }
});
