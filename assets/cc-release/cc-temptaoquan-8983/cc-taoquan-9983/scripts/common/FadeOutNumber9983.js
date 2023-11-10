cc.Class({
    extends: cc.Component,

    properties: {
        labelWinAmount: cc.Label,
    },

    onLoad() {
        this.node.on("FADE_OUT_NUMBER", this.fadeOutNumber, this);
        this.node.on("FADE_OUT_NUMBER_FAST", this.fadeOutNumberFast, this);
        this.node.on("STOP_FADING", this.stopFading, this);
    },

    fadeOutNumberFast() {
        if (!this.labelWinAmount.string) return;
        if (this.fadeAction != null) {
            this.node.stopAction(this.fadeAction);
            this.fadeAction = null;
        }
        this.node.isFading = false;
        this.node.emit("RESET_NUMBER");
        this.labelWinAmount.node.opacity = 255;
    },

    fadeOutNumber(time = 1) {
        if (!this.labelWinAmount.string) return;
        this.node.isFading = true;

        this.fadeAction = cc.sequence(
            cc.fadeOut(time),
            cc.callFunc(() => {
                this.node.isFading = false;
                this.node.emit("RESET_NUMBER");
                this.labelWinAmount.node.opacity = 255;
            })
        );
        this.labelWinAmount.node.runAction(this.fadeAction);
    },

    stopFading() {
        if (this.fadeAction != null && this.node.isFading) {
            this.node.stopAction(this.fadeAction);
            this.fadeAction = null;
            this.node.isFading = false;
            this.labelWinAmount.node.opacity = 255;
        }
    },
});
