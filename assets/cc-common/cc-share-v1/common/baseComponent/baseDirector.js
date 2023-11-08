

cc.Class({
    switchMode() {
        if (!this.gameTrialSupport) return;

        if (!this.trialMode) {
            cc.log("Switch To Trial");
            this.trialMode = true;
            this.gameStateManager.switchToTrial();
        } else {
            cc.log("Switch Back To Real");
            this.trialMode = false;
            this.gameStateManager.switchToReal();
        }
    },
    runAction(actionName,data) {
        if (!this.writer || typeof this.writer['makeScript'+actionName] !== 'function') return;
        let script = this.writer['makeScript'+actionName](data);
        this.script = script;
        this.executeNextScript(script);
    },
    executeNextScript(script) {
        if (!script || script.length == 0) return;

        const { command, data } = script.shift();
        if (this[command] && typeof this[command] === 'function') {
            //cc.log('run command ',command, data, script);
            this[command](script,data);
        }
    },
    destroyData() {
        this.runAction = () => {};
        this.executeNextScript = () => {};
        this.script = [];
    }
});
