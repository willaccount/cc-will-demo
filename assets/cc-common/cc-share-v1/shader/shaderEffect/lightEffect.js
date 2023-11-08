

cc.Class({
    extends: cc.Component,

    properties: {
        speed: 1.0,
    },

    start () {
        const sprite = this.node.getComponent(cc.Sprite);
        if(sprite) {
            this.material = sprite.getMaterial(0);
        } else {
            const spine = this.node.getComponent(sp.Skeleton);
            if(spine) {
                this.material = spine.getMaterial(0);
            }
        }
        this.iTime = 0;
        cc.tween(this)
            .repeatForever(cc.tween()
                .to(1.0 / this.speed, {iTime: 0.5})
                .delay(1.0 / this.speed)
                .to(1.0 / this.speed, {iTime: 0.0})
                .delay(1.0 / this.speed * 1.5)
            )
            .start();
    },

    update () {
        if(!this.material) return;
        this.material.setProperty('iTime', this.iTime);
        // this.iTime += this.speed * dt;
    },
});
