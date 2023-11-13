cc.Class({
    extends: require('SlotSymbolPaylinev2'),

    playAnimation(duration = 2, isNearWin = false) {
        const NORMAL_DURATION = 2;
        if (this.havingAnim) {
            this.spineNode.opacity = 255;
            this.spineNode.active = true;
            this.staticSymbol.opacity = 0;
            if (this.animation.findAnimation("animation")) {
                this.animation.setAnimation(0, "animation", isNearWin);
                this.animation.timeScale = NORMAL_DURATION / duration;
            } else {
                cc.warn("wrong animation name on spine: ", this.animation.skeletonData.name);
            }
        }
        else {
            this.staticSymbol.opacity = 255;
            this.staticSymbol.active = true;
            this.staticSymbol.scale = 1;
            this.spineNode.opacity = 0;
            this.node.opacity = 255;
            this.displayWinEffect();
            cc.tween(this.staticSymbol)
                .to(0.5, { scale: 1.1 })
                .to(0.5, { scale: 1 })
                .repeatForever()
                .start();
        }
    },

    stopAnimation() {
        this.staticSymbol.stopAllActions();
        this.staticSymbol.scale = 1;
        this.staticSymbol.active = false;
        this.spineNode.active = false;

        this.hideWinEffect();
    },

    displayWinEffect() {
        this.winEffect.active = true;
        this.winEffect.playAnimation("WinLineAnim");
    },

    hideWinEffect() {
        this.winEffect.active = false;
    },
});