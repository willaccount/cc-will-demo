const {getRandomInt} = require('utils');
const NodePool = require('NodePool9983');
var configParticle9983  = cc.Class({
    name: 'configParticle9983',
    properties: {
        start: 0,
        end: 0
    }
});
cc.Class({
    extends: cc.Component,

    properties: {
        particleNode: cc.Node,
        particlePerSpawn: 0,
        spawnInterval: 0.1,
        speed: {
            type: configParticle9983,
            default:{}
        },
        gravity: 0,
        angle: {
            type: configParticle9983,
            default:{}
        },
        size: {
            type: configParticle9983,
            default: {}
        },
        radius: 0,
        duration: -1,
    },
    onLoad(){
        this.nodePool = new NodePool('ParticleItem9983');
        this.nodePool.init(this.particleNode);
        this.node.exit = this.exit.bind(this);
        this.node.setSpawnRate = this.setSpawnRate.bind(this);
        this.node.setItemSpeed = this.setItemSpeed.bind(this);
        this.node.setSpawnInterval = this.setSpawnInterval.bind(this);
    },
    start(){
        this.spawnTimer = 0;
        this.timer = 0;
    },
    exit(){
        this.node.removeAllChildren(true);
        this.timer = 0;
        for(let child of  this.node.children){
            child.stopAnimation();
        }
        this.nodePool.clearPool();
    },
    setSpawnRate(perSpawn){
        this.particlePerSpawn = perSpawn;
    },
    setItemSpeed(minSpeed, maxSpeed) {
        this.speed = {
            start: minSpeed,
            end: maxSpeed
        };
    },
    setSpawnInterval(interval){
        this.spawnInterval = interval;
    },

    update(dt) {
        if(this.duration < 0 || this.timer <= this.duration) {
            this.timer += dt;
            this.spawnTimer += dt;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnTimer -= this.spawnInterval;
                for (let i = 0; i < this.particlePerSpawn; i++) {
                    let node = this.nodePool.getObj();
                    node.parent = this.node;
                    // node.active = true;
                    node.angle = getRandomInt(0,360);
                    node.scale = this.size.start + Math.random() * (this.size.end - this.size.start) * 2;
                    let angle = cc.misc.degreesToRadians(this.angle.start) + Math.random() * (cc.misc.degreesToRadians(this.angle.end) - cc.misc.degreesToRadians(this.angle.start));
                    node.position = (this.radius === 0) ? cc.v2(0,0) : this.generatePoint(angle);
                    let speed = this.speed.start + Math.random() * (this.speed.end - this.speed.start);
                    node.startAnimation(Math.cos(angle) * speed, Math.sin(angle) * speed, 0, this.gravity);
                }
            }
        }
    },
    generatePoint(angle){
        // let angle = cc.misc.degreesToRadians(this.angle.start) + Math.random() * (cc.misc.degreesToRadians(this.angle.end) - cc.misc.degreesToRadians(this.angle.start));
        let x = Math.cos(angle)*this.radius;
        let y = Math.sin(angle)*this.radius;
        return cc.v2(x,y);
    }
});