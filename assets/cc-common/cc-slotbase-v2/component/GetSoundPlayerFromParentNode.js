

cc.Class({
    extends: cc.Component,
    onLoad () {
        if (this.node.parent.soundPlayer) {
            this.node.soundPlayer = this.node.parent.soundPlayer;
        } else {
            this.node.soundPlayer = this.node;
            cc.error("There is no sound player from parent");
        }
    }
});
