
cc.Class({
    extends: cc.Component,

    properties: {
        delay:1,
        animationName: "animation",
        loop:false
    },
    onLoad(){
        //this.node.getComponent(sp.Skeleton).setAnimation(0, this.animationName, this.loop);
    },
    start(){
        this.node.runAction(cc.sequence(
            cc.callFunc(() => {
                this.node.getComponent(sp.Skeleton).setAnimation(0, this.animationName, this.loop);
            }),
            cc.delayTime(this.delay),
        ).repeatForever());
    },
});
