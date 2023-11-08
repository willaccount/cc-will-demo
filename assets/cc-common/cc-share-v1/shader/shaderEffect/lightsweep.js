

cc.Class({
    extends: cc.Component,

    properties: {
        speed: 1.0,
    },

    start () {
        const sprite = this.node.getComponent(cc.Sprite);
        if(sprite) {
            this.material = sprite.getMaterial(0);
        }
        this.iTime = 0;
    },

    update (dt) {
        if(!this.material) return;
        this.material.setProperty('iTime', this.iTime);
        this.iTime += this.speed * dt;
    },
});
