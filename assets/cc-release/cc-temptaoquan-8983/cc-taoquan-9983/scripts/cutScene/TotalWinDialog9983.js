const cutsceneMode = require('CutsceneMode');
const { formatMoney } = require('utils');
cc.Class({
    extends: cutsceneMode,

    properties: {
        overlay: cc.Node,
        winAmount: cc.Node,
    },
    enter() {
        this.isShow = true;
        this.winAmount.getComponent(cc.Label).string = '';
        //Overwrite this when extends
        if (this.node.soundPlayer) this.node.soundPlayer.stopAllAudio();
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXTotalWin();
        this.node.runAction(cc.sequence(
            cc.callFunc(() => {
                this.winAmount.getComponent(cc.Label).string = formatMoney(this.content.winAmount);
            }),
            cc.fadeIn(0.5),
            cc.delayTime(4),
            cc.callFunc(() => {
                if (this.node.soundPlayer) this.node.soundPlayer.stopSFXTotalWin();
                cc.log("Cutscene contents: ",this.content);
            }),
            cc.fadeOut(0.5),
            cc.callFunc(this.exit,this),
        ));
    },

    bindButtonQuickShow() {
        this.bindButtonAnimation = cc.sequence(
            cc.delayTime(1),
            cc.callFunc(() => {
                this.overlay.on('click', () => {
                    if (this.isShow) {
                        this.quickShow();
                    }
                });
            }), 
        );
        this.overlay.runAction(this.bindButtonAnimation);
    },

    quickShow() {
        if (!this.isShow) return;
        this.isShow = false;
        this.node.stopAllActions();
        this.overlay.off('click');
        this.overlay.stopAction(this.bindButtonAnimation);
        
        this.node.runAction(cc.sequence(
            cc.callFunc(() => {
            }),
            cc.delayTime(0.5),
            cc.fadeOut(0.5),
            cc.callFunc(() => {
                if (this.node.soundPlayer) this.node.soundPlayer.stopSFXTotalWin();
                this.winAmount.getComponent(cc.Label).string = '';
                this.exit();
            })
        ));
    },

    show() {
        this.node.active = true;
        this.node.opacity = 0;
        this.bindButtonQuickShow();
    },
});
