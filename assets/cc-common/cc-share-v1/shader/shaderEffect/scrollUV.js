

cc.Class({
    extends: cc.Component,

    properties: {
        speedX: 0,
        speedY: 0,
    },

    start () {
        const sprite = this.node.getComponent(cc.Sprite);
        if(sprite) {
            this.material = sprite.getMaterial(0);
        }
        this.offsetY = 0;
        this.offsetX = 0;
    },

    update (dt) {
        if(!this.material) return;
        this.offsetY += this.speedY * dt;
        this.offsetY %= 1;
        this.offsetX += this.speedX * dt;
        this.offsetX %= 1;
        this.material.setProperty('offset', cc.v2(this.offsetX, this.offsetY));
    },
});
