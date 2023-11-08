const {reverseEasing} = require('globalAnimationLibrary');
const {formatMoney} = require('utils');

cc.Class({
    extends: require('CutsceneMode'),

    properties: {
        megaRate: 25,
        superRate: 40,
        winAmount: cc.Node,
        overlayNode: cc.Node,
        fastParticle: cc.ParticleSystem,
        title: cc.Node,
        titleFrame: [cc.SpriteFrame],
        winInfo: cc.Node,
        coinsEffect: cc.Node,
        delayShowTime: 2,
        hideTime: 0.5,
        animDuration: 9
    },

    onLoad() {
        this._super();
        this.label = this.winAmount.getComponentInChildren(cc.Label);
        this.isShowFastEffect = false;
        this.isShowNormalEffect = false;
    },

    enter() {
        this.node.stopAllActions();
        let modeTurbo = false;
        if (this.node.gSlotDataStore) modeTurbo = this.node.gSlotDataStore.modeTurbo;   
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
        this.fastParticle.node.stopAllActions();
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
        this.winInfo.opacity = 255;
        this.playSoundStart();
        const scaleTime = 0.2;
        this.winAmount.stopAllActions();
        this.winAmount.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(scaleTime, 1.2),
            cc.scaleTo(scaleTime, 1),
        )));
        if (this.title) {
            this.title.stopAllActions();
            this.title.runAction(cc.repeatForever(cc.sequence(
                cc.scaleTo(0.5, 1.2),
                cc.scaleTo(0.5, 1),
            )));
        }
        this.initValue();
        this.startParticle();
        this.startUpdateWinAmount();
    },

    playSoundStart() {

    },

    playSoundEnd() {

    },

    initValue() {
        this.winInfo.scale = 1;
        this.currentValue = 0;
        this.currentTitle = 0;
        this.label.string = '';
        if (this.title) {
            this.title.getComponent(cc.Sprite).spriteFrame = this.titleFrame[0];
        }
        this.megaWinAmount = this.content.currentBetData * this.megaRate;
        this.superWinAmount = this.content.currentBetData * this.superRate;
        this.isUpdating = true;
        this.speedUp = false;
        this.bindQuickShow();
    },

    bindQuickShow() {
        this.skippable = false;
        this.node.stopAllActions();
        this.node.runAction(cc.sequence(
            cc.delayTime(this.hideTime),
            cc.callFunc(() => {
                this.skippable = true;
            }),
            cc.delayTime(this.animDuration - this.delayShowTime),
            cc.callFunc(() => {
                this.skippable = false;
            }),
        ));
    },

    startParticle() {
        this.coinsEffect.emit('START_PARTICLE');
        if(this.content.winAmount > this.megaWinAmount) {
            this.coinsEffect.emit('DROP_MONEY');
        }
    },

    startUpdateWinAmount() {
        const speedUpEasing = t => t*t; // constant accelerated
        const slowDownEasing = reverseEasing(t => t*t);
        const halfAmount = 0.5 * this.content.winAmount;
        this.currentTween = cc.tween(this);
        this.currentTween
            .to(0.5*this.animDuration, {currentValue: halfAmount}, {easing: speedUpEasing})
            .to(0.5*this.animDuration, {currentValue: this.content.winAmount}, {easing: slowDownEasing})
            .delay(0.5)
            .call(() => {
                this.skippable = false;
                this.currentTween = null;
                this.finish();
            });
        this.currentTween.start();
    },

    update() {
        if (!this.isUpdating) return;
        this.label.string = formatMoney(this.currentValue);
        if (this.currentValue >= this.superWinAmount && this.currentTitle == 1) {
            this.changeTitle(2);
        } else if (this.currentValue >= this.megaWinAmount  && this.currentTitle == 0) {
            this.changeTitle(1);
        }
    },

    changeTitle(index) {
        this.currentTitle = index;
        if (!this.title) return;
        this.title.stopAllActions();
        cc.tween(this.title)
            .to(0.3, {scale: 2, opacity: 0})
            .call(()=>{
                this.title.getComponent(cc.Sprite).spriteFrame = this.titleFrame[index];
            })
            .to(0.3, {scale: 1, opacity: 255})
            .call(()=>{
                this.title.stopAllActions();
                this.title.runAction(cc.repeatForever(cc.sequence(
                    cc.scaleTo(0.5, 1.2),
                    cc.scaleTo(0.5, 1),
                )));
            })
            .start();
    },

    onClick() {
        if (!this.isUpdating || this.speedUp) return;
        if (!this.skippable) return;

        this.speedUp = true;
        this.winAmount.stopAllActions();
        const scaleTime = 0.13;
        this.winAmount.stopAllActions();
        this.winAmount.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(scaleTime, 1.2),
            cc.scaleTo(scaleTime, 1),
        )));

        this.playSoundEnd();

        if (this.currentTween) {
            this.currentTween.stop();
            this.currentTween = null;
        }
        cc.tween(this)
            .to(1, {currentValue: this.content.winAmount})
            .call(() => {
                this.finish();
            })
            .start();
    },

    stopParticle() {
        this.coinsEffect.emit('STOP_PARTICLE');
    },

    finish() {
        this.isUpdating = false;
        this.label.string = formatMoney(this.content.winAmount);
        this.winAmount.stopAllActions();
        this.stopParticle();
        this.winInfo.stopAllActions();
        this.winInfo.runAction(cc.sequence(
            cc.delayTime(this.delayShowTime),
            cc.scaleTo(this.hideTime, 0),
            cc.callFunc(()=>{
                //this.node.soundPlayer.playBackgroundMusic();
                this.label.string = '';
                this.winInfo.opacity = 0;
                this.exit(); // exit cutscene
            })
        ));
    },
    exit(){
        this.isShowFastEffect = false;
        this.isShowNormalEffect = false;
        this.callback && this.callback();
        this.callback = null;
        this.node.emit("STOP");
        if(this.node.mainDirector && this.node.mainDirector.onIngameEvent){
            this.node.mainDirector.onIngameEvent("ON_CUTSCENE_CLOSE");
        }
        this.node.active = false;
    },

    onDisable() {
        if (this.currentTween) {
            this.currentTween.stop();
            this.currentTween = null;
        }
    }
});
