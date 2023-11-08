

cc.Class({
    extends: cc.Component,
    onLoad() {
        this.node.writer = this;
    },
    makeScriptResume(data) {
        this.node.gSlotDataStore.formatData(data);
        return [
            {
                command: "_stateResume",
            },
        ];
    },
    makeScriptUpdate(data) {
        this.node.gSlotDataStore.formatData(data);
        return [
            {
                command: "_stateUpdate",
            },
        ];
    },
});
