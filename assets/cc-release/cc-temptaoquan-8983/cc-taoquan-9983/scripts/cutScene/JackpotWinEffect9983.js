const {formatMoney} = require('utils');
const WIN_ANIM = {
    0: 'jackpot_Tai',
    1: 'jackpot_Loc',
};
const PARTICLE_CONFIG = {
    0: {spawn: 8, interval: 0.2, minSpeed: 400, maxSpeed: 800},
    1: {spawn: 6, interval: 0.25, minSpeed: 400, maxSpeed: 750},
};

cc.Class({
    extends: require('CutsceneMode'),

    properties: {
        winAnim: cc.Node,
        winAmount: cc.Node,
        phaoHoaParticle: cc.Node,
        phaoHoaLeft: cc.Node,
        phaoHoaRight: cc.Node,
        listBGAmount: {
            default: [],
            type: cc.SpriteFrame,
        },
        bgAmount: cc.Node,
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
        }
    },


    onLoad() {
        this._super();
        this.soundPlayer = (this.node.soundPlayer) ? this.node.soundPlayer : this.node;
        this.rateMega = 30;
        this.rateSuper = 50;
        this.duration = 10;
        this.extendTime = 14;
        this.typeWin = 0;
    },

    _updateCoinWin() {
        this.winAmount.getComponent(cc.Label).string = formatMoney(Number(this._coinValue));
    },
    quickShow() {
        if (this.coinValue === this.winValue) {
            this.node.stopAllActions();
            this.tweenCoin.stop();
            this.hideFn();
            return;
        }
        this.node.getComponent(cc.Button).interactable = false;

        this.node.stopAllActions();
        this.tweenCoin.stop();
        this.tweenCoin = cc.tween(this)
            .to(0.8, {coinValue: this.winValue}, {easing: "quadOut"})
            .delay(1)
            .call(this.hideFn.bind(this))
            .start();
      
    },

    enter() {
    },
    config3DParticle(type){
        let par3D = this.node.getChildByName('3dParticle');
        let conf = PARTICLE_CONFIG[type];
        par3D.setSpawnRate(conf.spawn);
        par3D.setItemSpeed(conf.minSpeed, conf.maxSpeed);
        par3D.setSpawnInterval(conf.interval);
    },

    show() {
        this._super();
        let data = this.content;
        this.bgAmount.getComponent(cc.Sprite).spriteFrame = this.listBGAmount[data.jackpotId];
        this.currentBetData = data.currentBetData;
        this.winValue = data.jackpotAmount;
        this.winAnim.getComponent(sp.Skeleton).setSkin(WIN_ANIM[parseInt(data.jackpotId)]);
        this.winAnim.getComponent(sp.Skeleton).setSlotsToSetupPose();
        this.winAnim.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
        this.config3DParticle(parseInt(data.jackpotId));
        this.showEffectWin();
    },

    showEffectWin() {
        this.soundPlayer.node.emit("STOP_ALL_AUDIO");
        this.soundPlayer.node.emit("PLAY_WIN_LOOP");

        this.phaoHoaParticle.getComponent(cc.ParticleSystem).resetSystem();
        this.phaoHoaLeft.active = true;
        this.phaoHoaRight.active = true;
        this.phaoHoaLeft.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
        this.phaoHoaRight.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
        cc.tween(this.node)
            .delay(0.5)
            .call(() => {
                this.node.getComponent(cc.Button).interactable = true;
            })
            .start();
        this._tweenCoin(this.winValue);
    },

    /**
     * @effect
     **/
    _tweenCoin(winAmount) {
        let superValue = this.winValue * 0.75;
        let megaValue = this.winValue * 0.5;
        const extendDelayTime = this.node.gSlotDataStore && this.node.gSlotDataStore.isAutoSpin ? this.extendTime : 0;
        this.tweenCoin = cc.tween(this)
            .to(this.duration / 3, {coinValue: megaValue}, {easing: "sineInOut"})
            .to(this.duration / 3, {coinValue: superValue}, {easing: "sineInOut"})
            .to(this.duration / 3, {coinValue: winAmount}, {easing: "sineInOut"})
            .delay(extendDelayTime)
            .call(() => {
                if (this.node.gSlotDataStore && this.node.gSlotDataStore.isAutoSpin) {
                    this.hideFn();
                }
            });
        this.tweenCoin.start();
       
    },

    resetEffectWin() {
      
        let par3D = this.node.getChildByName('3dParticle');
        this.config3DParticle(0);
        par3D.exit();

        this.coinValue = 0;
        this.typeWin = 0;
        this.winAmount.getComponent(cc.Label).string = "";
        this.winAnim.getComponent(sp.Skeleton).clearTrack(0);
        this.phaoHoaParticle.getComponent(cc.ParticleSystem).stopSystem();
        this.phaoHoaLeft.active = false;
        this.phaoHoaRight.active = false;


        if(this._hideAction!=null && this._hideAction.target!=null){
            this.node.stopAction(this._hideAction);
            this._hideAction = null;
        }
    },

    hideFn() {
        this._hideAction = cc.sequence(
            cc.delayTime(0.5),
            cc.fadeOut(0.5),
            cc.callFunc(() => {
                this.soundPlayer.node.emit("STOP_WIN_LOOP");
                this.soundPlayer.node.emit("PLAY_SOUND_BACKGROUND");
                this.resetEffectWin();
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
    }
});
