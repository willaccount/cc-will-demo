

cc.Class({
    extends: cc.Component,
    onLoad() {
        this.node.director = this;
        this.lastCommand = null;
        this.onExtendedLoad();
    },
    start() {
        this.writer = this.node.writer;
        this.forceToExitMode = false;
        this.exitScript = [];
    },
    onExtendedLoad(){},
    runAction(actionName,data) {
        if (!this.writer || typeof this.writer['makeScript'+actionName] !== 'function') return;
        let script = this.writer['makeScript'+actionName](data);
        this.executeNextScript(script);
    },
    executeNextScript(script) {
        if (!this.writer || !script || script.length == 0 || this.isSkipAllScrips) return;
        this.script = script;
        if(this.forceToExitMode && this.exitScript && this.exitScript.length >0){
            this.script = this.exitScript;
        }
        // if(this.script.length === 0) return;
        const nextScript = this.script.shift();
        let { command, data } = nextScript;

        command = this.getCommandName(command);
        this.lastCommand = command;
        if (this[command] && typeof this[command] === 'function') {
            cc.log(this.name+' run command', command, data);
            this[command](this.script,data);
        } else {
            cc.error('There is no '+this.name+' command', command);
            this.executeNextScript(this.script);
        }
    },
    getCommandName(command) {
        let gameSpeed = this.getGameSpeed();
        while (gameSpeed > 0) {
            const commandWithSpeed = command + '_' + gameSpeed;
            if (this[commandWithSpeed] && typeof this[commandWithSpeed] === 'function') {
                return commandWithSpeed;
            }
            gameSpeed--;
        }
        return command;
    },
    destroyData() {
        this.runAction = () => {};
        this.executeNextScript = () => {};
        this.script = [];
    },

    forceToExit(script){
        this.forceToExitMode = true;
        this.exitScript = script;
    },

    resetGameSpeed() {
        this.node.gSlotDataStore.gameSpeed = this.getDefaultGameSpeed();
    },
    setGameSpeed(gameSpeed) {
        this.node.gSlotDataStore.gameSpeed = gameSpeed || this.getDefaultGameSpeed();
    },
    setGameSpeedMode(mode = 'NORMAL') {
        const GAME_SPEED = this.getGameSpeedConfig();
        this.node.gSlotDataStore.gameSpeed = GAME_SPEED[mode] || GAME_SPEED.NORMAL;
    },
    getGameSpeed() {
        return this.node.gSlotDataStore.gameSpeed || this.getDefaultGameSpeed();
    },
    getDefaultGameSpeed() {
        const GAME_SPEED = this.getGameSpeedConfig();
        return this.node.gSlotDataStore.modeTurbo ? GAME_SPEED.TURBO : GAME_SPEED.NORMAL;
    },
    getGameSpeedConfig() { // remove after all games updated
        if (this.node.config && this.node.config.GAME_SPEED) {
            return this.node.config.GAME_SPEED;
        } else {
            return {
                NORMAL: 0,
                TURBO: 1,
                INSTANTLY: 2,
            };
        }
    },
    getRemainScripts() {
        let result = [];
        if (this.script) {
            result = this.script.map(it => {return it.command;});
        }
        return result;
    },
    getLastCommand() {
        return this.lastCommand;
    },
});
