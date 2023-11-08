

cc.Class({
    extends: cc.Component,

    properties: {
        panel: cc.Node,
    },

    onLoad () {
        this.node.on("SHOW_PANEL",this.enter,this);
        this.node.on("HIDE_PANEL",this.exit,this);
        this.node.on("CLOSE_PANEL",this.closePanel,this);
        this.panel.active = false;
        this.fadeSpeed = 0.2;
        this.isShowing = false;
    },

    enter() {
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
        this.isShowing = true;
        this.panel.active = true;
        this.panel.runAction(cc.fadeIn(this.fadeSpeed));
    },
    exit() {
        if(!this.isShowing) return;
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
        this.closePanel();
    },

    closePanel() {
        this.isShowing = false;
        this.panel.runAction(cc.sequence(
            cc.fadeOut(this.fadeSpeed),
            cc.callFunc(() => {
                this.panel.active = false;
            }),
        ));
    }
});
