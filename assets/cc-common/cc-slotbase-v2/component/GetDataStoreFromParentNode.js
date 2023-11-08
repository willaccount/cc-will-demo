

cc.Class({
    extends: cc.Component,
    onLoad () {
        if (this.node.parent.gSlotDataStore) {
            this.node.gSlotDataStore = this.node.parent.gSlotDataStore;
        } else {
            cc.error("There is no datastore from parent");
        }
    },
});
