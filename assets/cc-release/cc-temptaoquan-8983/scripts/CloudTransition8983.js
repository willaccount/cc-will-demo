
cc.Class({
    extends: require('CutsceneMode'),

    properties: {
        animDurationTime: 1,
    },

    enter() {
        this.cloudAnimation = this.getComponent(cc.Animation);
        this.cloudAnimation.play('CloudTransition9983');

        this.delayTween = cc.tween(this.node);
        this.delayTween
            .delay(this.animDurationTime)
            .call(() => {
                this.exit();
            })
            .start();
    },
});
