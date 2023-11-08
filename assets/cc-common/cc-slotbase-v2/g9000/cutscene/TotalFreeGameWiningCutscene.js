const CutsceneMode = require('CutsceneMode');
const {formatMoney} = require('utils');
cc.Class({
    extends: CutsceneMode,

    properties: {
        overlayNode: cc.Node,
        contentNode: cc.Node,
        particleNode: cc.Node,
        winAmountLabel: cc.Label,
        freeSpinTimesLabel: cc.Label,
        appearingDuration: 4
    },

    onLoad() {
        this._super();
        this._isShow = false;
    },

    show() {
        const {totalFreeWinAmount, totalFreeSpinTime} = this.content;

        if (totalFreeWinAmount) {
            const convertedAmount = formatMoney(totalFreeWinAmount);
            if (convertedAmount) {
                this.winAmountLabel.string = convertedAmount;
            } else {
                this.winAmountLabel.string = totalFreeWinAmount;
            }

        } else {
            this.winAmountLabel.string = "0";
        }

        if (totalFreeSpinTime) {
            this.freeSpinTimesLabel.string = totalFreeSpinTime;
        }
        this._super();
        this.overlayNode.opacity = 0;
        this.playShowingAnimation();
        this._isShow = true;
    },


    enter() {

    },

    bindButtonClicked() {
        this._appearingAction = cc.sequence(
            cc.delayTime(this.appearingDuration),
            cc.callFunc(() => {
                this.onExitButtonClicked();
            }));

        this.node.runAction(this._appearingAction);
    },

    onExitButtonClicked() {
        if (!this._isShow) {
            return;
        }

        this._isShow = false;
        this.playClosingAnimation(() => {
            this.resetNode();
            this.exit();
        });
    },

    playShowingAnimation() {
        cc.log(`Play Free Winning Cutscene Showing Animation`);
        this._showContent();
    },

    _showContent() {
        this.overlayNode.runAction(cc.fadeTo(0.3, 220));
        this.contentNode.scale = 0;
        this.tweenShow = cc.tween(this.contentNode)
            .delay(0.5)
            .call(() => {
                if (this.node.soundPlayer) {
                    this.node.soundPlayer.playSoundSumFreeStart();
                }
                if (this.content.totalFreeWinAmount > 0) {
                    this._playParticle();
                }
            })
            .to(0.5, {scale: 1}, {easing: "backOut"})
            .call(() => {
                this.bindButtonClicked();
            });

        this.tweenShow.start();
    },
    _hideContent() {
        if (this.node.soundPlayer) {
            this.node.soundPlayer.stopSoundSumFreeStart();
            this.node.soundPlayer.playSoundSumFreeEnd();
        }
        this.tweenHide = cc.tween(this.contentNode)
            .to(0.5, {scale: 0}, {easing: "backIn"})
            .call(() => {
                this.overlayNode.runAction(cc.fadeOut(0.5));
            });

        this.tweenHide.start();
    },

    _playParticle() {
        this._isPlayParticle = true;
        this.particleNode.active = true;
        this.particleNode.getComponent(cc.ParticleSystem).resetSystem();
    },
    _stopParticle() {
        this._isPlayParticle = false;
        this.particleNode.getComponent(cc.ParticleSystem).stopSystem();
    },

    playClosingAnimation(callback) {
        cc.log(`Play Free Winning Cutscene Closing Animation`);
        if (this._isPlayParticle) {
            this._stopParticle();
        }
        this.node.runAction(cc.sequence(
            cc.delayTime(0.1),
            cc.callFunc(this._hideContent.bind(this)),
            cc.delayTime(1),
            cc.callFunc(() => {
                callback && callback();
            }),
        ));
    },

    resetNode() {
        this.particleNode.active = false;
        if (this._appearingAction) {
            this.node.stopAction(this._appearingAction);
            this._appearingAction = null;
        }

        if (this.tweenShow) {
            this.tweenShow.stop();
            this.tweenShow = null;
        }

        if (this.tweenHide) {
            this.tweenHide.stop();
            this.tweenHide = null;
        }

    }

});
