

cc.Class({
    extends: cc.Component,
    // use this for initialization
    init (data) {
        this.getComponent(cc.RichText).string = data;
        this.getComponent(cc.Animation).play('toastMoving');
    },
});
