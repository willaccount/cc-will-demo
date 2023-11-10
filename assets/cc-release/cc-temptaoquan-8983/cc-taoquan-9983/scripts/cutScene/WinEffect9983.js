const {formatMoney} = require('utils');

const WIN_ANIM = {
    0: 'thanglon',
    1: 'thangcuclon',
    2: 'thangsieulon'
};
const PARTICLE_CONFIG = {
    0: {spawn: 4, interval: 0.25, minSpeed: 300, maxSpeed: 750},
    1: {spawn: 6, interval: 0.25, minSpeed: 400, maxSpeed: 750},
    2: {spawn: 8, interval: 0.2, minSpeed: 400, maxSpeed: 800},
};
cc.Class({
    extends: require('CutsceneMode'),

    properties: {
        winAnim: cc.Node,
        winAmount: cc.Node,
        overlayNode: cc.Node,
        fastParticle: cc.ParticleSystem,
        winInfo: cc.Node,
        phaoHoaLeft: cc.Node,
        phaoHoaRight: cc.Node,
        phaoHoaParticle: cc.Node,
        _coinValue: 0,
        coinValue: {
            visible: false,
            get: function () {
                return this._coinValue;
            },
            set: function (value) {
                this._coinValue = value;
                this._updateCoinWin();
            }
        },
        coinParticle3D: cc.Node,
    },


    onLoad() {
        this._super();
        this.soundPlayer = (this.node.soundPlayer) ? this.node.soundPlayer : this.node;
        this.rateMega = 30;
        this.rateSuper = 50;
        this.duration = 9;
        this.typeWin = 0;
        this.isShowFastEffect = false;
        this.isShowNormalEffect = false;
    },

    _updateCoinWin() {
        this.winAmount.getComponent(cc.Label).string = formatMoney(this.coinValue);
        if (this.currentBetData) {
            if (this.coinValue >= this.currentBetData * this.rateSuper && this.typeWin === 1) {
                this._changeTitleWin(2);
            } else if (this.coinValue >= this.currentBetData * this.rateMega && this.typeWin === 0) {
                this._changeTitleWin(1);
            }
        }
    },

    update() {
        // if (!this.isUpdating) return;
        this.winAmount.getComponent(cc.Label).string = formatMoney(this.coinValue);
        // if (this.currentValue >= this.superWinAmount && this.currentTitle == 1) {
        //     this.changeTitle(2);
        // } else if (this.currentValue >= this.megaWinAmount  && this.currentTitle == 0) {
        //     this.changeTitle(1);
        // }
    },

    quickShow() {
        if (this.coinValue === this.winValue) {
            return;
        }
        this.overlayNode.getComponent(cc.Button).interactable = false;

        this.node.stopAllActions();
        this.tweenCoin.stop();
        this.tweenCoin = cc.tween(this)
            .to(0.8, {coinValue: this.winValue}, {easing: "quadOut"})
            .call(this.hideFn.bind(this))
            .start();
    },

    enter() {

    },

    config3DParticle(type){
        let conf = PARTICLE_CONFIG[type];
        this.coinParticle3D.setSpawnRate(conf.spawn);
        this.coinParticle3D.setItemSpeed(conf.minSpeed, conf.maxSpeed);
        this.coinParticle3D.setSpawnInterval(conf.interval);
    },

    show() {
        this._super();
        this.overlayNode.getComponent(cc.Button).interactable = true;
        let data = this.content;
        this.currentBetData = data.currentBetData;
        this.winValue = data.winAmount;
        const {modeTurbo} = this.node.gSlotDataStore;
        modeTurbo ? this.showFastEffectWin() : this.showEffectWin();
        this.node.fullDisplay = !modeTurbo;
    },

    showFastEffectWin() {  // turbo
        if (this.isShowFastEffect) {
            this.callback && this.callback();
            this.callback = null;
            return;
        }
        this.isShowFastEffect = true;
        this.winInfo.opacity = 0;
        if (this.overlayNode) {
            this.overlayNode.active = false;
        }
        this.fastParticle.node.opacity = 0;
        this.fastParticle.node.runAction(cc.sequence(
            cc.delayTime(0.1),
            cc.fadeIn(0.1),
        ));
        this.fastParticle.resetSystem();
        this.callback && this.callback();
        this.callback = null;
        if( this._fastEffectAction){
            this.node.stopAction(this._fastEffectAction);
        }
        this._fastEffectAction = cc.sequence(
            cc.delayTime(1),
            cc.callFunc(()=>{
                this.fastParticle.stopSystem();
            }),
            cc.delayTime(2),
            cc.callFunc(()=>{
                this.isShowFastEffect = false;
                this.isShowNormalEffect = false;
                this.exit();
            }),
        );
        this.node.runAction(this._fastEffectAction);
    },

    showEffectWin() {
        this.isShowNormalEffect = true;
        if(this.overlayNode){
            this.overlayNode.active = true;
        }
        this.fastParticle.node.opacity = 0;
        this.winInfo.opacity = 255;
        this.winAnim.getComponent(sp.Skeleton).setSkin(WIN_ANIM[0]);
        this.winAnim.getComponent(sp.Skeleton).setSlotsToSetupPose();
        this.winAnim.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);

        this.soundPlayer.node.emit("STOP_ALL_AUDIO");
        this.soundPlayer.node.emit("PLAY_WIN_LOOP");

        this.phaoHoaLeft.active = true;
        this.phaoHoaRight.active = true;
        this.phaoHoaLeft.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
        this.phaoHoaRight.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
        this.phaoHoaParticle.getComponent(cc.ParticleSystem).resetSystem();
        cc.tween(this.node)
            .delay(2)
            .call(() => {
                this.overlayNode.getComponent(cc.Button).interactable = true;
            })
            .start();
        this._tweenCoin(this.winValue);

        if (this.node.mainDirector.currentGameMode) {
            const currentSlotDirector = this.node.mainDirector.currentGameMode.director;
            if(currentSlotDirector){
                currentSlotDirector.buttons.emit("ENABLE_SPIN_KEY", false);
            }
        }
    },

    /**
     * @effect
     **/
    _tweenCoin(winAmount) {
        let superValue = this.rateSuper * this.currentBetData;
        let megaValue = this.rateMega * this.currentBetData;
        if (winAmount >= superValue) {
            // thang cuc lon
            this.tweenCoin = cc.tween(this)
                .to(this.duration / 3, {coinValue: megaValue}, {easing: "sineInOut"})
                .to(this.duration / 3, {coinValue: superValue}, {easing: "sineInOut"})
                .to(this.duration / 3, {coinValue: winAmount}, {easing: "sineInOut"})
                .call(() => {
                    this.hideFn();
                });
        } else if (winAmount >= megaValue) {
            // thang rat lon
            this.tweenCoin = cc.tween(this)
                .to(this.duration / 2, {coinValue: megaValue}, {easing: "sineInOut"})
                .to(this.duration / 2, {coinValue: winAmount}, {easing: "sineInOut"})
                .call(() => {
                    this.hideFn();
                });
        } else {
            // thang lon
            this.tweenCoin = cc.tween(this)
                .to(this.duration, {coinValue: winAmount}, {easing: "sineInOut"})
                .call(() => {
                    this.hideFn();
                });
        }

        this.tweenCoin.start();
    },
    _changeTitleWin(type) {
        this.typeWin = type;
        let spine = this.winAnim.getComponent(sp.Skeleton);
        // spine.clearTrack(0);
        spine.setSkin(WIN_ANIM[type]);
        spine.setSlotsToSetupPose();
        // spine.setAnimation(0, 'animation', true);
        this.config3DParticle(type);
        this.soundPlayer.node.emit("PLAY_TEXT_CHANGE");

        if (this.typeWin === 1) {
            // this.soundPlayer.playSoundBigWinMega();
        } else if (this.typeWin === 2) {
            // this.soundPlayer.playSoundBigWinFortune();
        }
    },
 
    resetEffectWin() {
        // let overlay = this.node.getChildByName('overlay');
        this.config3DParticle(0);
        this.coinParticle3D.exit();
        this.config3DParticle(0);

        this.coinValue = 0;
        this.typeWin = 0;
        this.winAmount.getComponent(cc.Label).string = "";
        this.winAnim.getComponent(sp.Skeleton).clearTrack(0);

        this.phaoHoaParticle.getComponent(cc.ParticleSystem).stopSystem();
        //this.phaoHoaParticle.active = false;
        this.phaoHoaLeft.active = false;
        this.phaoHoaRight.active = false;
       


        if(this._hideAction!=null && this._hideAction.target!=null){
            this.node.stopAction(this._hideAction);
            this._hideAction = null;
        }
    },

    hideFn() {
        this.soundPlayer.node.emit("STOP_WIN_LOOP");
        this.soundPlayer.node.emit("PLAY_WIN_END");
        this._hideAction = cc.sequence(
            cc.delayTime(1.5),
            cc.fadeOut(0.5),
            cc.callFunc(() => {
                this.soundPlayer.node.emit("PLAY_SOUND_BACKGROUND");
                this.resetEffectWin();
                this.isShowFastEffect = false;
                this.isShowNormalEffect = false;

                if (this.node.mainDirector.currentGameMode) {
                    const currentSlotDirector = this.node.mainDirector.currentGameMode.director;
                    if(currentSlotDirector){
                        currentSlotDirector.buttons.emit("ENABLE_SPIN_KEY", true);
                    }
                }
                this.exit();
            }),
        );
        this.node.runAction(this._hideAction);
    },

    onDisable() {
        this.node.stopAllActions();
        if (this.tweenCoin) {
            this.tweenCoin.stop();
        }
    },
});
