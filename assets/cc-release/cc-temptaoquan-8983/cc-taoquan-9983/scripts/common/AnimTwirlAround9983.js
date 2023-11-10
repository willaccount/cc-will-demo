cc.Class({
    extends: cc.Component,

    properties: {
        duration: 2,
    },
    onLoad() {
        cc.tween(this.node)
            .by(this.duration, { angle: -360 })
            .repeatForever()
            .start();
    },
});
