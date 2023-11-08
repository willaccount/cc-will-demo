

const{RotatingObject} = require('CustomType');

cc.Class({
    extends: cc.Component,

    properties: {
        targetNodes: {
            type: RotatingObject,
            default: [],
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {},

    start () {

    },

    update (dt) {
        for(let i = 0; i< this.targetNodes.length; i++){
            let node = this.targetNodes[i].node;
            const speed = this.targetNodes[i].speed;
            const minAngle = this.targetNodes[i].minAngle;
            const maxAngle = this.targetNodes[i].maxAngle;
            const varSpeed = (Math.random()-0.5)*2*this.targetNodes[i].speedVar;
            if(node!=null&&node!==undefined){
                node.angle += this.targetNodes[i].clockwise*(speed+varSpeed)*dt;
                if(node.angle<=minAngle && this.targetNodes[i].clockwise<0){
                    this.targetNodes[i].clockwise = -this.targetNodes[i].clockwise;
                }

                if(node.angle>=maxAngle && this.targetNodes[i].clockwise>0){
                    this.targetNodes[i].clockwise = -this.targetNodes[i].clockwise;
                }
            }
        }
    },
});
