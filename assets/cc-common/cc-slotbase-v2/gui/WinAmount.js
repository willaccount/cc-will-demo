cc.Class({
    extends: cc.Component,

    properties: {
        bg: cc.Node,
        win: {
            default: null,
            type: cc.SpriteFrame,
        },
        lastWin: {
            default: null,
            type: cc.SpriteFrame,
        },
        textWin: 'THẮNG',
        textLastWin: 'MỚI THẮNG'
    },

    onLoad () {
        this.node.on("UPDATE_WIN_AMOUNT",this.updateWinAmount,this);
        this.node.on("CHANGE_TO_LAST_WIN",this.updateBgToLastWin,this);
        this.node.on("CHANGE_TO_WIN",this.updateBgToWin,this);
    },
    updateWinAmount({value, time}) {
        this.node.emit("UPDATE_ANIMATE_STYLE",{value, time});
    },
    updateBgToWin() {
        if (this.bg.getComponent(cc.Sprite)) {
            this.bg.getComponent(cc.Sprite).spriteFrame = this.win;
        } else if (this.bg.getComponent(cc.Label)) {
            this.bg.getComponent(cc.Label).string = this.textWin;
        }
    },
    updateBgToLastWin() {
        if (this.bg.getComponent(cc.Sprite)) {
            this.bg.getComponent(cc.Sprite).spriteFrame = this.lastWin;
        } else if (this.bg.getComponent(cc.Label)) {
            this.bg.getComponent(cc.Label).string = this.textLastWin;
        }
    }
});
