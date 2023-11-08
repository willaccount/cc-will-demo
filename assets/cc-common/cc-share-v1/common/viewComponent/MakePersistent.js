

cc.Class({
    extends: cc.Component,

    onLoad () {
        cc.game.addPersistRootNode(this.node);
    },
});
