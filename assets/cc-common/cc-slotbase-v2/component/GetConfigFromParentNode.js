

cc.Class({
    extends: cc.Component,
    onLoad () {
        if (this.node.parent.config) {
            this.node.config = this.node.parent.config;
        } else {
            cc.error("There is no config from parent");
        }
    },
});
