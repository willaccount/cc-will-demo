

cc.Class({
    extends: cc.Component,
    editor: {
        executeInEditMode: true,
        // playOnFocus: true,
    },
    properties: {
        particles:{
            type: cc.ParticleSystem,
            default: [],
        },
        fadeInTime: 0,
        fadeOutTime: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {},
    playEffect(){
        for(let i = 0; i< this.particles.length; i++){
            const particle = this.particles[i];
            if(particle){
                particle.node.opacity = 0;
                particle.node.active = true;
                if(this.fadeInTime>0){
                    particle.node.stopAllActions();
                    particle.node.runAction(
                        cc.sequence(
                            cc.fadeIn(this.fadeInTime),
                            cc.callFunc(()=>{
                                particle.resetSystem();
                            }),
                        )
                    );
                }else{
                    particle.node.opacity = 255;
                    particle.resetSystem();
                }
                
            }
        } 
    },

    stopEffect(callback = null){
        for(let i = 0; i< this.particles.length; i++){
            const particle = this.particles[i];
            if(particle){
                particle.stopSystem();
                if(this.fadeOutTime>0){
                    particle.node.stopAllActions();
                    particle.node.runAction(
                        cc.sequence(
                            cc.fadeOut(this.fadeOutTime),
                            cc.callFunc(()=>{
                                particle.node.active = false;
                                callback&&callback();
                            }),
                        )
                    );
                }else{
                    particle.node.opacity = 0;
                    particle.node.active = false;
                    callback&&callback();
                }
            }
        } 
    },

    onDestroy(){
        this.particles = [];
        this.particles = null;
    },

});
