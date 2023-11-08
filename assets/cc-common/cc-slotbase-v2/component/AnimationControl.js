

cc.Class({
    extends: cc.Component,

    properties: {

        isPlaying:{
            get(){
                let _playing = false;
                if(this._animation!=null && this._animState!=null){
                    _playing = this._animState.isPlaying;
                }
                return _playing;
            },

            visible: false,
        },

        onAnimationStartedDelegates:{
            get(){
                return this._onAnimationStartedDelegates;
            },

            visible: false,
        },

        onAnimationChangedDelegates:{
            get(){
                return this._onAnimationChangedDelegates;
            },

            visible: false,
        },
    
        onAnimationCompleteDelegates:{
            get(){
                return this._onAnimationCompleteDelegates;
            },

            visible: false,
        },
    
        currentAnimationState: {
            get(){
                return this._animState;
            },

            visible: false,
        },
    },
    

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._animation = null;
        this._animState = null;
        this._onAnimationCompleteDelegates = [];
        this._onAnimationStartedDelegates = [];
        this._onAnimationChangedDelegates = [];
        this._animation = this.node.getComponent(cc.Animation);
    },

    start () {
        // Obtain animation state of default animation clip first if any
        if(this._animation!=null){
            let defaultClip = this._animation.defaultClip;
            this._animState = this._animation.getAnimationState(defaultClip.name);
        }
    },

    


    playAnimation(clipName = '', speed = 1, isLoop = false, isAdditive = false){
        if(this._animation!=null){
            if(isAdditive){
                if(clipName!=""){
                    this._animState = this._animation.playAdditive(clipName);
                }else{
                    // play default clip
                    this._animState = this._animation.playAdditive();
                }
            }else{
                if(clipName!=""){
                    this._animState = this._animation.play(clipName);
                }else{
                    // play default clip
                    this._animState = this._animation.play();
                }
            }
            

            if(this._animState!=null){
                this._animState.speed = speed;
                this._animState.wrapMode = isLoop? cc.WrapMode.Loop: cc.WrapMode.Normal;
            }
        }
        
    },

    setCurrentSpeed(newSpeed){
        if(this._animState!=null){
            this._animState.speed = newSpeed;
        }
    },

    stopAnimation(clipName = ''){
        if(this._animation!=null){
            if(clipName!=""){
                this._animation.stop(clipName);
            }else{
                //stop all the animations
                this._animation.stop();
            }
        }
    },

    onAnimationEnded(){
        if(this._animState!=null){
            cc.log(`This animation clip name: ${this._animState.name} is stopped`);

            for(let i = 0; i < this._onAnimationCompleteDelegates.length; i++){
                let delegate = this._onAnimationCompleteDelegates[i];
                delegate&&delegate();
            }
        }
    },

    onAnimationStarted()
    {
        if(this._animState!=null){
            cc.log(`This animation clip name: ${this._animState.name} is started`);

            for(let i = 0; i < this._onAnimationStartedDelegates.length; i++){
                let delegate = this._onAnimationStartedDelegates[i];
                delegate&&delegate();
            }
        }
    },

    onAnimationChanged(param)
    {
        cc.log('Param: ' + param);
        if(this._animState!=null){
            cc.log(`This animation clip name: ${this._animState.name} is changed param`);

            for(let i = 0; i < this._onAnimationChangedDelegates.length; i++){
                let delegate = this._onAnimationChangedDelegates[i];
                delegate&&delegate(param);
            }
        }
    },
});
