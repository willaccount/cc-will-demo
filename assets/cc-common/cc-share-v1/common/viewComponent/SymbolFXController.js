

cc.Class({
    extends: cc.Component,

    properties: {
        particleBotLeft: cc.Node,
        particleTopRight: cc.Node,
        effectDuration: 1,
        topLeft: cc.Vec2,
        topRight: cc.Vec2,
        botLeft: cc.Vec2, 
        botRight: cc.Vec2,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let botLeftSeq =  cc.sequence(
            cc.moveTo(this.effectDuration/2, this.botRight).easing(cc.easeSineOut()), 
            cc.moveTo(this.effectDuration/2, this.topRight).easing(cc.easeSineOut()),
            cc.moveTo(this.effectDuration/2, this.topLeft).easing(cc.easeSineOut()),
            cc.moveTo(this.effectDuration/2, this.botLeft).easing(cc.easeSineOut()),
        );
        let topRightSeq = cc.sequence(
            cc.moveTo(this.effectDuration/2,this.topLeft).easing(cc.easeSineOut()),
            cc.moveTo(this.effectDuration/2,this.botLeft).easing(cc.easeSineOut()),
            cc.moveTo(this.effectDuration/2,this.botRight).easing(cc.easeSineOut()),
            cc.moveTo(this.effectDuration/2,this.topRight).easing(cc.easeSineOut()),
        );
        this._botleftAction = cc.repeatForever(botLeftSeq);
        this._topRightAction = cc.repeatForever(topRightSeq);
        this._isPlaying = false;
    },

    playEffect(){
        if(this._isPlaying) return;
        this.particleBotLeft.postion = this.botLeft;
        this.particleTopRight.postion = this.topRight;
        this.particleBotLeft.active = true;
        this.particleTopRight.active = true;
        
        this.particleBotLeft.runAction(this._botleftAction);
        this.particleTopRight.runAction(this._topRightAction);
        this._isPlaying = true;
    },

    stopEffect(){
        if (this._isPlaying) {
            this.particleBotLeft.stopAction(this._botleftAction);
            this.particleTopRight.stopAction(this._topRightAction);
            this.particleBotLeft.active = false;
            this.particleTopRight.active = false;
            this._isPlaying = false;
        }
    },
});
