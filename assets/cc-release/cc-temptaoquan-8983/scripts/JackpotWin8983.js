cc.Class({
    extends: require('JackpotWinv2'),

    properties: {
        winAnimSkeleton: sp.Skeleton,
        phaoLeftNode: cc.Node,
        phaoRightNode: cc.Node,
        phaoHoaNode: cc.Node,
    },

    play(content, callback) {
        this.content = content;
        this.callback = callback;
        this.show(content);
        this.enter();
    },

    show(content) {
        const { subSymbol1, subSymbol2 } = content;
        this.node.opacity = 255;
        this.node.active = true;
        const phaoLeftSkeleton = this.phaoLeftNode.getComponent(sp.Skeleton);
        const phaoRightSkeleton = this.phaoRightNode.getComponent(sp.Skeleton);

        this.winAnimSkeleton.node.opacity = 255;
        this.winAnimSkeleton.node.active = true;
        this.phaoLeftNode.active = true;
        this.phaoRightNode.active = true;
        phaoLeftSkeleton.setAnimation(0, 'animation', true);
        phaoRightSkeleton.setAnimation(0, 'animation', true);
        this.phaoHoaNode.active = true;
        if (subSymbol1) {
            this.winAnimSkeleton.setSkin("jackpot_Tai");
        } else if (subSymbol2) {
            this.winAnimSkeleton.setSkin("jackpot_Loc");
        }
        this.winAnimSkeleton.setAnimation(0, 'animation', true);
    },

    finish() {
        this.tweenParticles = cc.tween(this.node);
        this.tweenParticles
            .delay(this.delayShowTime)
            .call(() => {
                this.phaoLeftNode.active = false;
                this.phaoRightNode.active = false;
                this.phaoHoaNode.active = false;
            })
            .start();

        this._super();
    },
});