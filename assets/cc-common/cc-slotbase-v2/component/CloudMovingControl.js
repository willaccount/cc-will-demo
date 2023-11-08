

cc.Class({
    extends: cc.Component,

    properties: {
        clouds: [cc.Node],
        minSpeed: 50,
        maxSpeed: 150,
        leftBorderX: -1200,
        rightBorderX: 1200,
        minPosY: -100,
        maxPosY: 100,
        playOnStart: true,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on("PLAY_EFFECT", this.playEffect, this);
        this.node.on("STOP_EFFECT", this.stopEffect, this);
    },

    start () {
        for(let i=0; i<this.clouds.length; i++){
            this.clouds[i].speed = (Math.random()>0.5? 1:-1)* (Math.random()*(this.maxSpeed - this.minSpeed) + this.minSpeed);
        }
        if(this.playOnStart){
            this.playEffect();
        }
    },

    playEffect(){
        this._isPlaying = true;
    },

    stopEffect(){
        this._isPlaying = false;
        for(let i=0; i<this.clouds.length; i++){
            this.clouds[i].speed = (Math.random()>0.5? 1:-1)* (Math.random()*(this.maxSpeed - this.minSpeed) + this.minSpeed);
        }
    },

    update (dt) {
        if(this._isPlaying){
            for(let i=0; i<this.clouds.length; i++){
                const cloud = this.clouds[i];
                cloud.x += cloud.speed*dt;

                if(cloud.x>this.rightBorderX){
                    cloud.x = this.leftBorderX;
                    cloud.y = Math.random()*(this.maxPosY-this.minPosY)+this.minPosY;
                }else if(cloud.x < this.leftBorderX){
                    cloud.x = this.rightBorderX;
                    cloud.y = Math.random()*(this.maxPosY-this.minPosY)+this.minPosY;
                }
            }
        }
    },
});
