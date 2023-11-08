

cc.Class({
    extends: cc.Component,

    properties: {
        delayTimeMin: 0.5,
        delayTimeMax: 2,
        durationMin: 0.5,
        durationMax: 2,
        repeatForever: true,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.resetEffect();
    },

    playEffect(){
        let delay = Math.random()*(this.delayTimeMax-this.delayTimeMin) + this.delayTimeMin;
        let duration = Math.random()*(this.durationMax-this.durationMin) + this.durationMin;
        let angle = Math.random()*360 - 180;
        this._action = cc.sequence(
            cc.delayTime(delay),
            cc.spawn(
                cc.scaleTo(duration/2, 1,1).easing(cc.easeBackOut()),
                cc.fadeIn(duration/2),
                cc.rotateTo(duration/2, angle/2),
            ),
            cc.rotateTo(duration, angle),
            cc.delayTime(delay),
            cc.spawn(
                cc.scaleTo(duration/2, 0,0).easing(cc.easeBackOut()),
                cc.fadeOut(duration/2),
            ),
            cc.callFunc(()=>{
                this.resetEffect();
                if(this.repeatForever){
                    this.playEffect();
                }
            }),
        );

        this.node.runAction(this._action);
    },

    resetEffect(){
        this.node.scale = 0;
        this.node.angle = 0;
        this.node.opacity = 0;
    },

    stopEffect(){
        if(this._action && this._action.target!=null){
            this.node.stopAction(this._action);
            this._action = null;
        }
        this.resetEffect();
    },

    onDestroy(){
        this.stopEffect();
    }

    // update (dt) {},
});
