const START_R_M = 30;
const MAX_BLUR_STR = 1;

cc.Class({
    extends: cc.Component,

    properties: {
        transitionDur: 1.0,
        blurDur: 0.2,
    },

    onLoad(){
        this.node.activeTransition = this.activeTransition.bind(this);
    },

    start () {
        const sprite = this.node.getComponent(cc.Sprite);
        if(sprite) {
            this.material = sprite.getMaterial(0);
        }
        this.timePassed = 0;
        this.material.setProperty('Strength', 0);
        this.material.setProperty('radiusMultiple', 0);
    },

    activeTransition(){
        this.material.setProperty('Strength', 0);
        this.material.setProperty('radiusMultiple', 0);
        this.startBlur();
        this.node.runAction(cc.sequence(
            cc.delayTime(this.blurDur),
            cc.callFunc(()=>{
                this.startFadeOut();
            })
        ));
        return this.transitionDur + this.blurDur;
    },

    update () {
        if(!this.material) return;
        if(this.blurActived) {
            this.material.setProperty('Strength', this.blurStr);
        }
        if(this.transitionActived) {
            const radiusMultiple = Math.max(0.0, START_R_M - this.timePassed);
            this.material.setProperty('radiusMultiple', radiusMultiple);
        }
    },

    startFadeOut(){
        this.transitionActived = true;
        this.timePassed = 0;
        cc.tween(this)
            .to(this.transitionDur, {timePassed: START_R_M}, {easing: 'cubicOut'})
            .call(()=>{
                this.transitionActived = false;
            })
            .start();
    },

    startBlur(){
        this.blurStr = 0;
        this.blurActived = true;
        cc.tween(this)
            .to(this.transitionDur, {blurStr: MAX_BLUR_STR})
            .start();
        this.node.runAction(cc.scaleTo(this.transitionDur, 3));
    }
});
