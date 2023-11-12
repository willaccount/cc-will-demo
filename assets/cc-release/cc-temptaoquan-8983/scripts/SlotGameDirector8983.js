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
});