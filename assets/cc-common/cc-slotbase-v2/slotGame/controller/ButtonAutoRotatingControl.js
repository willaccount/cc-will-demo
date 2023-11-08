

cc.Class({
    extends: cc.Component,

    properties: {
        radius: 50,
        normalSpeed: 10,
        highSpeed: 20,
        rotatingSpeed: 5,
        isClockwise: false,
        circleMovingNodes: [cc.Node],
        highSpeedColor : cc.Color,
        normalSpeedColor : cc.Color,
        highSpeedColorVarStar : cc.Color,
        normalSpeedColorVarStar : cc.Color,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._timer = 0;
        this._speed = 0;
        if(this.circleMovingNodes && this.circleMovingNodes.length>0){
            this._segmentAngle = (2*Math.PI)/this.circleMovingNodes.length;
        }
        this.node.on("ON_SPIN_CLICK", this.onSpinClick, this);
        this.node.on("ON_SPIN_SHOW", this.onSpinShow, this);

    },

    start () {
        this._speed = this.normalSpeed;
        this.rotateNodes();
        this._parentRotating = false;
    },

    update (dt) {
        this.rotateNodes(dt, true);
        if(this._parentRotating){
            this.node.angle += (this.isClockwise?-1:1)*this.rotatingSpeed*dt;
        }
    },

    rotateNodes(dt, isRotate = false){
        if(this.circleMovingNodes && this.circleMovingNodes.length>0){
            for(let i = 0; i<this.circleMovingNodes.length; i++){
                if(!isRotate){
                    this.circleMovingNodes[i]._rotateAngle = i*this._segmentAngle;
                }else{
                    this.circleMovingNodes[i]._rotateAngle += (this.isClockwise?-1:1)*this._speed*dt;
                }
                let x = Math.cos(this.circleMovingNodes[i]._rotateAngle)*this.radius;
                let y = Math.sin(this.circleMovingNodes[i]._rotateAngle)*this.radius;
                this.circleMovingNodes[i].position = new cc.Vec2(x,y);
            }
        }
    },

    onSpinClick(){
        this._speed = this.highSpeed;
        this._parentRotating = true;
        if(this.circleMovingNodes && this.circleMovingNodes.length>0)
        {
            for(let i = 0; i<this.circleMovingNodes.length; i++){
                const particle = this.circleMovingNodes[i].getComponent(cc.ParticleSystem);
                if(particle){
                    particle.startColor = this.highSpeedColor;
                    particle.endColor = this.highSpeedColor;
                    particle.startColorVar = this.highSpeedColorVarStar;
                }
            }
        }
    },

    onSpinShow(){
        this._speed = this.normalSpeed;
        this._parentRotating = false;
        for(let i = 0; i<this.circleMovingNodes.length; i++){
            const particle = this.circleMovingNodes[i].getComponent(cc.ParticleSystem);
            if(particle){
                particle.startColor = this.normalSpeedColor;
                particle.endColor = this.normalSpeedColor;
                particle.startColorVar = this.normalSpeedColorVarStar;
            }
        }
    },
});
