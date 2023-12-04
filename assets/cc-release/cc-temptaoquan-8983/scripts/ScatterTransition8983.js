
cc.Class({
    extends: require('CutsceneMode'),

    properties: {
        scrollNode: cc.Node,
        maskNode: cc.Node,
        phaoHoaNode: cc.Node
    },

    onLoad() {
        this._super();

        this.scrollNode.active = false;
        this.maskNode.active = false;
        this.phaoHoaNode.active = false;
    },

    enter() {
        this.displayTitle();
    },

    displayTitle() {
        this.phaoHoaNode.active = true;
        this.scrollNode.active = true;
        this.maskNode.active = true;

        this.maskTween = cc.tween(this.maskNode);
        this.maskTween
            .to(0.5, { width: 650 })
            .delay(1)
            .call(() => {
                this.exit();
            })
            .start();
    },
});