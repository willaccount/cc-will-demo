cc.Class({
    extends: require('TrialButton'),

    properties: {
        animationBtn: sp.Skeleton,
        blockInput: cc.Node,
        enterTrial: "Press_ChoiThu",
        idleTrial: "Idle_ChoiThu",
        enterReal: "Press_ChoiThat",
        idleReal: "Idle_ChoiThat",
        noAnimReal: "Idle_ChoiThat_NoAnim",
    },

    onLoad() {
        this._super();
        this.completeTrialSessionCount = 0;
        this.node.on("CAN_SWITCH_MODE", this.canSwitchMode, this);
        this.node.on("SHOW_BLOCK_INPUTS", this.showBlock, this);
        this.onEnableButtons(false);
        this.showBlock();
    },

    showBlock(isOn = false) {
        if (this.blockInput) this.blockInput.active = isOn;
    },

    canSwitchMode() {
        this.node.canClick = true;
    },

    start() {
        if (this.animationBtn) {
            this.animationBtn.setAnimation(0, this.idleTrial, true);
        }
    },

    onPlayTrialButtonClicked() {
        if (!this.node.canClick) return;
        this.playSoundClick();
        this._super();
        if (this.completeTrialSessionCount < 2) {
            this.displayRootNode.active = true;
            this.displayRootNode.runAction(cc.repeatForever(cc.sequence(
                cc.fadeTo(0.8, 150),
                cc.fadeTo(0.8, 255)
            )));
        } else {
            this.displayRootNode.stopAllActions();
            this.displayRootNode.opacity = 255;
        }
        if (this.playRealButton) {
            this.playRealButton.getComponent(cc.Button).interactable = false;
            this.node.runAction(cc.sequence(
                cc.delayTime(2.0),
                cc.callFunc(() => {
                    this.playRealButton.getComponent(cc.Button).interactable = true;
                })
            ));
        }

        this.playAnimTrialButton();
    },

    playAnimTrialButton() {
        if (this.animationBtn) {
            if (this.completeTrialSessionCount < 2) {
                this.animationBtn.setAnimation(0, this.enterTrial, false);
                this.animationBtn.addAnimation(0, this.idleReal, true);
            } else {
                this.animationBtn.setAnimation(0, this.enterTrial, false);
                this.animationBtn.addAnimation(0, this.noAnimReal, true);
            }
        }
    },

    onPlayRealButtonClicked() {
        if (!this.node.canClick) return;
        this.playSoundClick();
        this._super();
        if (this.playTrialButton) {
            this.playTrialButton.getComponent(cc.Button).interactable = false;
            this.node.runAction(cc.sequence(
                cc.delayTime(2.0),
                cc.callFunc(() => {
                    this.playTrialButton.getComponent(cc.Button).interactable = true;
                })
            ));
        }
        this.playAnimRealButton();
        this.completeTrialSessionCount++;
    },

    playAnimRealButton() {
        if (this.animationBtn) {
            if (this.completeTrialSessionCount < 2) {
                this.animationBtn.setAnimation(0, this.enterReal, false);
                this.animationBtn.addAnimation(0, this.idleTrial, true);
            } else {
                this.animationBtn.setAnimation(0, this.enterReal, false);
                this.animationBtn.addAnimation(0, this.idleTrial, false);
            }
        }
    },

    playSoundClick() {
        if (this.node.soundPlayer && this.node.soundPlayer.playSFXTrialButton) {
            this.node.soundPlayer.playSFXTrialButton();
        }
    }
});
