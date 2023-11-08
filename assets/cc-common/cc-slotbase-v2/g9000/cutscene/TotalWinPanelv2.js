const cutsceneMode = require('CutsceneMode');
const { formatMoney } = require('utils');
cc.Class({
    extends: cutsceneMode,

    properties: {
        winAmount: cc.Node,
        closeBtn: cc.Node,
        titleLabel: cc.Node,
    },

    onLoad() {
        this._super();
    },

    start() {
        this.localizeText();
    },

    localizeText() {
        if (this.titleLabel && this.node.config.MESSAGE_DIALOG) {
            this.titleLabel.getComponent(cc.Label).string = this.node.config.MESSAGE_DIALOG.YOU_WON;
        }
    },

    enter() {
        this.canClose = false;
        this.winAmount.getComponent(cc.Label).string = '';
        //Overwrite this when extends
        this.node.runAction(cc.sequence(
            cc.callFunc(() => {
                const {winAmount} = this.node.gSlotDataStore.playSession;
                this.winAmount.getComponent(cc.Label).string = formatMoney(winAmount);
                this.callback&&this.callback();
                this.callback = null;
            }),
            cc.delayTime(0.5),
            cc.callFunc(() => {
                this.canClose = true;
                this.closeBtn.getComponent(cc.Button).interactable = true;
            }),
            cc.delayTime(3.5),
            cc.callFunc(() => {
                this.exit();
            }),
        ));
    },

    close() {
        if (!this.canClose) return;
        this.canClose = false;
        this.closeBtn.getComponent(cc.Button).interactable = false;
        this.node.stopAllActions();
        this.node.runAction(cc.sequence(
            cc.fadeOut(0.5),
            cc.callFunc(() => {
                // this.node.soundPlayer.stopWinJackpot();
                this.exit();
            })
        ));
    },

    exit() {
        this.closeBtn.getComponent(cc.Button).interactable = false;
        this.callback && this.callback();
        this.callback = null;
        if(this.node.mainDirector){
            this.node.mainDirector.onIngameEvent("ON_CUTSCENE_CLOSE");
        }
        this.node.emit("STOP");
        this.node.active = false;
    }
});
