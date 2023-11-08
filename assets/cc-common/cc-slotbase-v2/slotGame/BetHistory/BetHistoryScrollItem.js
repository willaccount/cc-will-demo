

cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad() {
        this.node.setIndex = this.setIndex.bind(this);
    },

    onClick() {
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
        this.clickItemEvent = new cc.Event.EventCustom('ON_SCROLL_CLICK', true);
        // let index = this.index || 0;
        this.clickItemEvent.setUserData({
            index: this.index,
        });
        this.node.dispatchEvent(this.clickItemEvent);
    },

    setIndex(index) {
        this.index = index;
    }
});
