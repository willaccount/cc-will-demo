cc.Class({
    extends: require('JackpotWinv2'),

    properties: {
        winAnimSkeleton: sp.Skeleton,
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

        this.winAnimSkeleton.node.opacity = 255;
        this.winAnimSkeleton.node.active = true;
        if(subSymbol1) {
            this.winAnimSkeleton.setSkin("jackpot_Tai");
        } else if (subSymbol2) {
            this.winAnimSkeleton.setSkin("jackpot_Loc");
        }
        this.winAnimSkeleton.setAnimation(0, 'animation', true);
    }
});