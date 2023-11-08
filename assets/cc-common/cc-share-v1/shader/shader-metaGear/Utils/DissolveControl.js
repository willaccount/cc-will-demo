cc.Class({
    extends: cc.Component,

    properties: {
        normalTransitionDuration: 1,
        fastTransitionDuration: 0.3,
        lerpOnStart: true,
        isLoop: false,
        propName: "threshold",
        useLinear: false,
        useCubicEaseIn: false,
        useCubicEaseOut: false,
        customMaterial: {
            type: cc.Material,
            default: null,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._sprite = this.node.getComponent(cc.Sprite);
        this._mainMaterial = this._sprite.getMaterial(0);
        this._transitionFactor = 0;
        this._isLerping = false;
    },

    start () {
        if(this.lerpOnStart){
            this.lerpTransition(true);
        }
        this._timer = 0;
        this.transitionDuration = this.normalTransitionDuration;
    },

    onEnable(){
        this._transitionFactor = 0;
        this._mainMaterial = this._sprite.getMaterial(0);
        this._mainMaterial.setProperty(this.propName, 1 - this._transitionFactor);
    },

    update (dt) {
        if(this._isLerping){
            if(this.useLinear){
                this._transitionFactor+= dt*(1/this.transitionDuration);
            }else if(this.useCubicEaseIn){
                this._timer += dt;
                this._transitionFactor = this.cubicEasingIn(this._timer, 0, 1, this.transitionDuration);
            }else if(this.useCubicEaseOut){
                this._timer += dt;
                this._transitionFactor = this.cubicEasingOut(this._timer, 0, 1, this.transitionDuration);
            }else{
                this._isLerping = false;
                return;
            }
            
            if(this._transitionFactor>1){
                if(this.isLoop){
                    this._transitionFactor = 0;
                }else{
                    this._isLerping = false;
                    this.node.emit("TRANSITION_COMPLETE");
                }
                this._timer = 0;
            }
            this._mainMaterial = this._sprite.getMaterial(0);
            this._mainMaterial.setProperty(this.propName,1 - this._transitionFactor);
        }
    },

    startFadeIn(isTurbo = false){
        this.transitionDuration = isTurbo? this.fastTransitionDuration : this.normalTransitionDuration;
        this.lerpTransition(true);
    },

    startFadeOut(isTurbo = false){
        this.transitionDuration = isTurbo? this.fastTransitionDuration : this.normalTransitionDuration;
        this.lerpTransition(false);
    },

    lerpTransition(isLerping){
        if(isLerping){
            this._sprite.setMaterial(0, this.customMaterial);
        }
        this._isLerping = isLerping;
        this._transitionFactor = 0;
        this._timer = 0;
        this._mainMaterial = this._sprite.getMaterial(0);
        this._mainMaterial.setProperty(this.propName, 1 - this._transitionFactor);
    },

    cubicEasingIn(time, beginVal, changeVal, duration){
        time /=duration;
        return changeVal*time*time*time + beginVal;
    },

    cubicEasingOut(time, beginVal, changeVal, duration){
        time /=duration;
        time--;
        return changeVal*(time*time*time+1) + beginVal;
    },

});