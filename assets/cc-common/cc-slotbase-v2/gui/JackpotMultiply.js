const { formatMoney } = require('utils');

cc.Class({
    extends: cc.Component,

    properties: {
        frameAnimation: cc.Node,
        multiplyAnimation: cc.Node,
        skinIdle: 'Idle',
        skinJackpot: 'Jackpot',
        skinMultiply: 'Multiply',
        animIde: 'Idle',
        animAppear: 'Appear',
        animDisAppear: 'Disappear',
        jackpotUIAnims: [cc.Node],
        jackpotNotice: cc.Node,
        jackpotLabelMask: cc.Node,
        jackpotLabelHolder: cc.Node,
        jackpotWinUsername: cc.Node,
        jackpotWinAmount: cc.Node,
        particleAppear: cc.Node,
        particleBG: cc.Node,
    },

    onLoad() {
        this.node.on("PLAY_ANIM_MULTIPLY", this.playAnimMultiply, this);
        this.node.on("STOP_ANIM_MULTIPLY", this.stopAnimMultiply, this);
        this.node.on("SHOW_ANIM_NOTICE_WIN_JP", this.showAnimNoticeWinJP, this);
        this.node.on("RESET_ANIM_NOTICE", this.resetAnimNotice, this);
        this.isRunningAppearAnim = false;
        this.isRunningDisappearAnim = false;
    },

    playAnimMultiply(multiply) {
        if (this.frameAnimation && !this.isRunningAppearAnim) {
            if (this.tweenFrame) this.tweenFrame.stop();
            this.tweenFrame = cc.tween(this.frameAnimation)
                .delay(0.2)
                .call(() => {
                    this.frameAnimation.getComponent(sp.Skeleton).setSkin(this.skinMultiply);
                    this.frameAnimation.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
                })
                .start();
        }

        if (this.multiplyAnimation) {
            const id = 'X' + multiply;
            this.multiplyAnimation.getComponent(sp.Skeleton).setSkin(id);
            if (!this.isRunningAppearAnim) {
                if (this.tweenMultiply) this.tweenMultiply.stop();
                this.multiplyAnimation.getComponent(sp.Skeleton).setSkin(id);
                this.multiplyAnimation.getComponent(sp.Skeleton).setAnimation(0, this.animAppear, false);

                this.tweenMultiply = cc.tween(this.multiplyAnimation)
                    .to(0.2, { opacity: 255 })
                    .call(() => {
                        this.multiplyAnimation.getComponent(sp.Skeleton).setAnimation(0, this.animIde, true);
                    })
                    .delay(0.1)
                    .call(() => {
                        if (this.particleAppear) {
                            this.particleAppear.getComponent(cc.ParticleSystem).resetSystem();
                            this.particleAppear.opacity = 255;
                        }
                        if (this.particleBG) {
                            this.particleBG.getComponent(cc.ParticleSystem).resetSystem();
                            this.particleBG.opacity = 255;
                        }
                    })
                    .delay(0.4)
                    .call(() => {
                        if (this.particleAppear) this.particleAppear.opacity = 0;
                    })
                    .start();
            }
        }

        if (!this.isRunningAppearAnim) this.isRunningAppearAnim = true;
        this.isRunningDisappearAnim = false;
    },

    stopAnimMultiply() {
        if (this.isRunningDisappearAnim) return;

        if (this.frameAnimation) {
            if (this.tweenFrame) this.tweenFrame.stop();
            this.frameAnimation.getComponent(sp.Skeleton).setSkin(this.skinIdle);
            this.frameAnimation.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
        }

        if (this.multiplyAnimation) {
            if (this.tweenMultiply) this.tweenMultiply.stop();
            if (this.multiplyAnimation.opacity !== 0) this.multiplyAnimation.getComponent(sp.Skeleton).setAnimation(0, this.animDisAppear, true);

            if (this.particleAppear) {
                this.particleAppear.getComponent(cc.ParticleSystem).stopSystem();
                this.particleAppear.opacity = 0;
            }
            if (this.particleBG) {
                this.particleBG.getComponent(cc.ParticleSystem).stopSystem();
                this.particleBG.opacity = 0;
            }
            this.tweenMultiply = cc.tween(this.multiplyAnimation)
                .delay(0.5)
                .to(0.2, { opacity: 0 })
                .start();
        }

        this.isRunningAppearAnim = false;
        this.isRunningDisappearAnim = true;
    },

    showAnimNoticeWinJP(jpAmount, dn = '', lv = 1) {
        if (!this.jackpotNotice || !this.jackpotWinUsername || !this.jackpotWinAmount) return;
        if (this.jackpotWinUsername) this.jackpotWinUsername.getComponent(cc.Label).string = dn;
        if (this.jackpotWinAmount) this.jackpotWinAmount.getComponent(cc.Label).string = (lv > 1 ? ('x' + lv + ' ') : '') + formatMoney(jpAmount);
        if (this.jackpotLabelHolder && this.jackpotLabelMask) {
            if (this.tweenjackpotNotice) this.jackpotNoticeTween.stop();
            if (this.tweenJackPotLabelHolder) this.tweenJackPotLabelHolder.stop();

            this.startX = 0;
            this.jackpotNoticeTween = cc.tween(this.jackpotNotice)
                .delay(0.5)
                .to(0.2, { opacity: 255})
                .call(() => {
                    if (this.frameAnimation) {
                        this.tweenFrame = cc.tween(this.frameAnimation)
                            .call(() => {
                                this.frameAnimation.getComponent(sp.Skeleton).setSkin(this.skinJackpot);
                                this.frameAnimation.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
                            })
                            .start();
                    }

                    if (this.jackpotUIAnims && this.jackpotUIAnims.length) {
                        this.jackpotUIAnims.forEach((item) => {
                            cc.tween(item)
                                .to(0.2, { opacity: 255 })
                                .start();
                        });

                    }

                    const labelHolderWidth = this.jackpotLabelHolder.children.reduce((acc, obj) => { return acc + obj.width; }, 0) + (5 * (this.jackpotLabelHolder.children.length - 1));
                    if (this.jackpotLabelMask.width < this.jackpotLabelHolder.width) {
                        this.startX = this.jackpotLabelHolder.x - (labelHolderWidth - this.jackpotLabelMask.width);
                        this.startX = parseInt(this.startX);
                    }
                    this.tweenJackPotLabelHolder = cc.tween(this.jackpotLabelHolder)
                        .to(2, { position: cc.v2(this.startX, this.jackpotLabelHolder.y) })
                        .start();
                })
                .start();
        }
    },

    resetAnimNotice() {
        if (this.tweenFrame) this.tweenFrame.stop();
        if (this.tweenjackpotNotice) this.jackpotNoticeTween.stop();
        if (this.tweenJackPotLabelHolder) this.tweenJackPotLabelHolder.stop();

        if (this.jackpotLabelHolder) this.jackpotLabelHolder.x = 0;
        if (this.jackpotNotice) {
            cc.tween(this.jackpotNotice)
                .to(0.2, { opacity: 0})
                .start();
        }

        if (this.frameAnimation) {
            this.frameAnimation.getComponent(sp.Skeleton).setSkin(this.skinIdle);
            this.frameAnimation.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
        }

        if (this.jackpotUIAnims && this.jackpotUIAnims.length) {
            this.jackpotUIAnims.forEach((item) => {
                cc.tween(item)
                    .to(0.2, { opacity: 0 })
                    .start();
            });
        }

        this.isRunningAppearAnim = false;
        this.isRunningDisappearAnim = false;
    },
});
