

cc.Class({
    extends: cc.Component,

    properties: {
        speed: 1.0,
    },

    onLoad(){
        this.node.on('ACTIVE_BLUR', this.activeBlur, this);
        this.node.on('STOP_BLUR', this.stopBlur, this);
        this.node.on('STOP_BLUR_SMOOTH', this.stopBlurSmooth, this);
    }, 

    start () {
        const sprite = this.node.getComponent(cc.Sprite);
        if(sprite) {
            this.material = sprite.getMaterial(0);
        }
        this.strength = 0;
        this.decreasing = false;
    },

    update (dt) {
        if(!this.material) return;
        this.material.setProperty('strength', this.strength);
        if(this.decreasing) {
            if(this.strength > 0) {
                this.strength -= this.speed * dt;
            } else {
                this.strength = 0;
                this.decreasing = false;
            }
        }
    },

    stopBlur(){
        this.strength = 0;
    },

    activeBlur(strength = 0.8){
        this.strength = strength;
    },

    stopBlurSmooth() {
        this.decreasing = true;
    }
});
