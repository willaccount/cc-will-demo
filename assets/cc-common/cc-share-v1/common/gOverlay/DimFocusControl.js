

cc.Class({
    extends: cc.Component,

    properties: {
        overlay: cc.Node,
        overlayOpacity: 150,
        game: cc.Node,
        gameOpacity: 150,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.dimControl = this;
        this.overlay.opacity = this.overlayOpacity;
    },

    dim() {
        this.node.parent.emit("PLT_BLUR");
        this.overlay.active = false;
        this.game.opacity = this.gameOpacity;
        if (this.game.soundPlayer) {
            this.game.soundPlayer.stopAllAudio();
            this.game.soundPlayer.setEffectEnable(false);
        }
    },
    focus() {
        this.node.parent.emit("PLT_FOCUS");
        this.overlay.active = true;
        this.game.opacity = 255;
        if (this.game.soundPlayer) {
            this.game.soundPlayer.setEffectEnable(true);
        }
    }

    // update (dt) {},
});
