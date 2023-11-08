

cc.Class({
    extends: cc.Component,

    properties: {
        
        radius: 100,
        offsetWidthHeight:10,
        speed: 20, // degree per frame 
    },
    
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._particleSystem = this.node.getComponent(cc.ParticleSystem);
        this._angle = 0;
    },

    onDisable(){
        this._particleSystem.resetSystem();
    },

    update (dt) {
        this._angle += (Math.PI/180)* this.speed * dt; // angle in radian
        let x = Math.cos(this._angle)*this.radius;
        let y = Math.sin(this._angle)*(this.radius-this.offsetWidthHeight);
        this.node.position = new cc.Vec2(x,y);
    },
});
