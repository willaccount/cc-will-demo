

cc.Class({
    extends: require("SlotSymbolPayline"),

    properties: {
        spineExpand: cc.Node,
        spineIdle: cc.Node,
        winEff: {
            default: [],
            type: cc.Node,
        },
        idleAnimation: "",
        expandAnimations:{
            type: cc.String,
            default: [],
        },

        expandTopPosY: 160,
        expandMidPosY: 0,
        expandBotPosY: -160,
    },

    onLoad() {
        this._super();
        this.node.playSpineAnimation = this.playSpineAnimation.bind(this);
        this.node.reset = this.reset.bind(this);
        
        if (this.spineExpand){
            this._spineSkeletonExp = this.spineExpand.getComponent(sp.Skeleton);
        }

        if (this.spineIdle){
            this._spineSkeletonIdle = this.spineIdle.getComponent(sp.Skeleton);
        }
    },
    
    playSpineAnimation(row) {
        if (this._spineSkeletonExp) {
            this.spineExpand.active = true;
            this.spineExpand.stopAllActions();
            this.spineExpand.opacity = 255;
            if (row == 0) {
                this.spineExpand.y = this.expandTopPosY;
            } else if (row == 1) {
                this.spineExpand.y = this.expandMidPosY;
            } else if (row == 2) {
                this.spineExpand.y = this.expandBotPosY;
            }
            let animationName = "";
            if (row >= 0 && row < this.expandAnimations.length) {
                animationName = this.expandAnimations[row];
            }
            this._spineSkeletonIdle && this._spineSkeletonIdle.setCompleteListener(()=>{});
            this._spineSkeletonExp.setCompleteListener(() => {
                this._spineSkeletonExp.setCompleteListener(()=>{});
                if(this.spineIdle){
                    this.spineExpand.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(()=>{
                        this.spineExpand.active = false;
                    })));
                    this.spineIdle.opacity = 255;
                    this.spineIdle.active = true;
                    this._spineSkeletonIdle.setAnimation(0, this.idleAnimation, true);
                }
            });
            this._spineSkeletonExp.setAnimation(0, animationName, false);
        }
    },

    reset() {
        if (this.spineExpand) {
            this.spineExpand.stopAllActions();
            this.spineExpand.opacity = 0;
            this.spineExpand.active = false;
        }
        if(this.spineIdle){
            this.spineIdle.opacity = 0;
            this.spineIdle.active = false;
        }

        this.winEff.forEach((item) => {
            item.active = false;
        });
    },

    playAnimation(row) {
        this.winEff[row].active = true;
        let animationControl = this.winEff[row].getComponent('AnimationControl');
        if(animationControl){
            animationControl.playAnimation('', 0.8, true, false);
        }
    },
    stopAnimation(row) {
        this.winEff[row].active = false;
    },
});
