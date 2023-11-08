

cc.Class({
    extends: cc.Component,
    properties: {
        speed: 1,
    },
    start () {
        this.node.on("GAME_HIDE",this.fadeOut,this);
        this.node.on("GAME_SHOW",this.fadeIn,this);
    },
    fadeOut (callback) {
        this.node.opacity = 255;
        this.node.runAction(cc.sequence(
            cc.fadeOut(this.speed),
            cc.callFunc(callback),
        ));
    },
    fadeIn (callback) {
        this.node.opacity = 0;
        this.node.runAction(cc.sequence(
            cc.fadeIn(this.speed),
            cc.callFunc(callback),
        ));
    },
});
