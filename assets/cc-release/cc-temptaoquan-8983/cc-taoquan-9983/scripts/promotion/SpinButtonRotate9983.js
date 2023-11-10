
cc.Class({
    extends: cc.Component,

    properties: {
        normalSpeed: 10,
        highSpeed: 20,
        isClockwise: false,
    },


    onLoad () {
        this._speed = 0;
        this.node.on("ON_SPIN_CLICK", this.onSpinClick, this);
        this.node.on("ON_SPIN_SHOW", this.onSpinShow, this);
    },

    start () {
        this._speed = this.normalSpeed;
    },

    update (dt) {
        this.node.angle += (this.isClockwise?-1:1)*this._speed*dt;
        if(this.node.angle>=720 || this.node.angle<=-720){
            this.node.angle = 0;
        }
    },

    onSpinClick(){
        this._speed = this.highSpeed;
    },

    onSpinShow(){
        this._speed = this.normalSpeed;
    },
});
