

cc.Class({
    extends: cc.Component,

    properties: {
        targetNode: cc.Node,
        direction: 1
    },

    onLoad() {
        this._onHover = this.onHover.bind(this);
        this._onMouseOut = this.onMouseOut.bind(this);
        if (this.targetNode) {
            this.targetNode.on(cc.Node.EventType.MOUSE_ENTER, this._onHover, null, true);
            this.targetNode.on(cc.Node.EventType.MOUSE_LEAVE, this._onMouseOut, null, true);
            this.targetNode.on("BUTTON_SPIN_SHOW", this.showIcon, this);
            this.targetNode.on("BUTTON_SPIN_HIDE", this.hideIcon, this);
        }
    },

    start() {
        this.rotateIcon();
    },

    showIcon() {
        this.node.opacity = 255;
    },

    hideIcon() {
        this.node.opacity = 0;
    },

    onHover() {
        this.rotateIcon(1);
    },

    onMouseOut() {
        this.rotateIcon();
    },

    rotateIcon(speed = 1.5) {
        this._tweenRotate && this._tweenRotate.stop();
        this._tweenRotate = cc.tween(this.node)
            .by(speed, { angle: -360 * this.direction })
            .repeatForever()
            .start();
    },
    onDestroy() {
        this._tweenRotate && this._tweenRotate.stop();
        if (this.targetNode) {
            this.targetNode.off(cc.Node.EventType.MOUSE_ENTER, this.onHover.bind(this));
            this.targetNode.off(cc.Node.EventType.MOUSE_ENTER, this.onHover.bind(this));
            this.targetNode.off("BUTTON_SPIN_SHOW", this.showIcon, this);
            this.targetNode.off("BUTTON_SPIN_HIDE", this.hideIcon, this);
        }
    }

});
