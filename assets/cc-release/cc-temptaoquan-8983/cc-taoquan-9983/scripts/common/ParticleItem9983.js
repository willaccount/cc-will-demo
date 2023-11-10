cc.Class({
    extends: cc.Component,

    properties: {
    },
    onLoad(){
        this.timer = 0;

        this.velX = 0;
        this.velY = 0;
        this.aclX = 0;
        this.aclY = 0;
        this.node.startAnimation = this.startAnimation.bind(this);
        this.node.stopAnimation = this.stopAnimation.bind(this);
        this.screenSize = cc.view.getVisibleSize();
    },

    startAnimation (velX, velY, aclX, aclY) {
        this.velX = velX;
        this.velY = velY;
        this.aclX = aclX;
        this.aclY = aclY;
        let anim = this.node.getComponent(cc.Animation);
        anim.play();
    },

    stopAnimation () {
        let anim = this.node.getComponent(cc.Animation);
        anim.stop();
        this.poolManager.put(this.node);
    },
    update (dt) {
        this.node.x += this.velX * dt;
        this.node.y += this.velY * dt;
        this.velX += this.aclX * dt;
        this.velY += this.aclY * dt;
        let pos = this.node.parent.convertToWorldSpaceAR(this.node.position);
        if( pos.x < -this.screenSize.width * 0.5 ||
            pos.x > this.screenSize.width * 1.5 ||
            pos.y < -this.screenSize.height * 0.5 ||
            pos.y > this.screenSize.height * 1.5){
            this.stopAnimation();
        }
    },
    //nodepool
    //Called whenever card object is get from Object Pool
    reuse(poolMng){
        this.poolManager = poolMng;
        this.node.active = true;
    },
    //Called whenever card object is returned to Object Pool
    unuse(){
        this.node.active = false;
    },
});