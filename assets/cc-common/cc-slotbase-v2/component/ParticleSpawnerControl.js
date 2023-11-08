

const PoolFactory = require('PoolFactory');

cc.Class({
    extends: cc.Component,

    properties: {
        poolFactory: {
            type: PoolFactory,
            default: null,
        },
        spawnPositions: [cc.Node],
        maxParticleCount: 20,
        minParticleCount: 15,
        minMovingSpeed: 10,
        maxMovingSpeed: 20,
        movingDirection: cc.Vec2.ONE,
        particlePrefabName: '',
        interval: 1,
        duration: 2,
        fromScale: 0.1,
        fromScaleVar: 0.1,

        toScale: 0.05,
        toScaleVar: 0.05,

        maxRotationYSpeed: 2,
        minRotationYSpeed: 0.5,
        maxRotationZSpeed: 2,
        minRotationZSpeed:-2,
        minInitAngle: -50,
        maxInitAngle: 50,
        _isPlaying: false,
        isPlaying:{
            get(){
                return this._isPlaying;
            },
            set(value){
                this._isPlaying = value;
            },
            visible: false,
        },
        spawnOnStart: false,
        isLoop : false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._usingObjects = [];
        this._timer = 0;
        this.isPlaying = false;
    },

    start(){
        if(this.spawnOnStart){
            this.spawn();
        }
    },

    spawn(){
        const quantity = this.getRandomInt(this.minParticleCount, this.maxParticleCount);
        for(let i = 0; i<quantity; i++){
            if(this.poolFactory){
                const particle = this.poolFactory.getObject(this.particlePrefabName);
                const speed = this.getRandomFloat(this.minMovingSpeed, this.maxMovingSpeed);
                const rotationYSpeed = this.getRandomFloat(this.minRotationYSpeed, this.maxRotationYSpeed);
                const _fromScale = this.fromScale + this.getRandomFloat(-this.fromScaleVar, this.fromScaleVar);
                const _toScale = this.toScale + this.getRandomFloat(-this.toScaleVar, this.toScaleVar);
                const scaleDelta = _toScale - _fromScale;
                const rotationZSpeed = this.getRandomFloat(this.minRotationZSpeed, this.maxRotationZSpeed);
                const initAngle = this.getRandomFloat(this.minInitAngle, this.maxInitAngle);
                if(particle){
                    particle.active = true;
                    particle.speed = speed;
                    particle.direction = this.movingDirection;
                    particle.scaleDelta = scaleDelta;
                    particle.scale = _fromScale;
                    particle.rotationZSpeed = rotationZSpeed;
                    const j = i%this.spawnPositions.length;
                    const parentNode = this.spawnPositions[j];
                    if(parentNode){
                        particle.x = Math.random()*parentNode.width - parentNode.width/2;
                        particle.y = Math.random()*parentNode.height - parentNode.height/2;
                        particle.parent = parentNode;
                    }else{
                        particle.x = Math.random()*this.node.width - this.node.width/2;
                        particle.y = Math.random()*this.node.height - this.node.height/2;
                        particle.parent = this.node;
                    }
                    particle.angle = initAngle;

                    const animationControl = particle.getComponent('AnimationControl');
                    if(animationControl){
                        animationControl.playAnimation('', rotationYSpeed, true);
                    }
                    this._usingObjects.push(particle);
                }
            }
        }
        this.isPlaying = true;
    },

    update(dt){
        if(this._isPlaying){
            this._timer += dt;
            if(this._timer>=this.interval){
                for(let i = 0; i<this._usingObjects.length; i++){
                    const particle = this._usingObjects[i];
                    if(particle){
                        const direction = particle.direction;
                        const speed = particle.speed;
                        const scaleDelta = particle.scaleDelta;
                        const rotationZSpeed = particle.rotationZSpeed;
                        particle.scale += dt * scaleDelta/this.duration;
                        particle.x += direction.x * speed*dt;
                        particle.y += direction.y * speed*dt;
                        particle.angle += rotationZSpeed;
                    }
                }
            }
            if(this._timer>= this.duration + this.interval){
                this.reset();
                if(this.isLoop){
                    this.spawn();
                }
            }
        }
    },

    reset(){
        for(let i = 0; i<this._usingObjects.length; i++){
            const particle = this._usingObjects[i];
            const animationControl = particle.getComponent('AnimationControl');
            if(animationControl){
                animationControl.stopAnimation();
            }
            if(particle && this.poolFactory){
                this.poolFactory.removeObject(particle);
            }
        }
        this._usingObjects = [];
        this._timer = 0;
        this._isPlaying = false;
    },

    getRandomFloat(min, max){
        return Math.random()*(max-min) + min;
    },

    getRandomInt(min, max){
        return Math.floor(this.getRandomFloat(min, max));
    }
});
