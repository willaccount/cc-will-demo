

cc.Class({
    extends: cc.Component,
    properties: {
        winAmount: cc.Node,
        introTips: cc.Node
    },
    onLoad() {
        this.node.hide = this.hide.bind(this);
        this.node.show = this.show.bind(this);
        this.node.getWinAmount = this.getWinAmount.bind(this);
        this.node.on("HIDE_INTRO", this.hideIntro.bind(this));
    },
    getWinAmount() {
        return this.winAmount;
    },
    hide() {
        this.node.emit('GAME_HIDE');
        this.node.active = false;
    },
    show() {
        this.node.emit('GAME_SHOW');
        this.node.active = true;
        this.node.opacity = 255;
    },

    hideIntro(){
        this.introTips && this.introTips.emit("HIDE_INTRO");
    }
});
