cc.Class({
    extends: require("SlotSymbolPaylinev2"),

    onLoad () {
        this._super();
        this.animation = this.spineNode.getComponent(sp.Skeleton);
    },

    init(symbolName) {
        const asset = this.assets[symbolName];
        this.symbolName = symbolName;
        let skeData = this.findSymbolSpineData(symbolName);
        this.havingAnim = skeData != undefined;
        if (asset) {
            this.staticSymbol.active = true;
            this.staticSymbol.getComponent(cc.Sprite).spriteFrame = asset;
        } else {
            this.staticSymbol.active = false;
        }
        if (skeData) {
            this.spineNode.active = true;
            this.spineNode.getComponent(sp.Skeleton).skeletonData = skeData.spine;
            this.animation = this.spineNode.getComponent(sp.Skeleton);
        } else {
            this.spineNode.active = false;
        }
    },

    playAnimation( isLoop = true){
        if (this.havingAnim) {
            this.isPlaying = true;
            this.spineNode.active = true;
            this.animation.setAnimation(0, "animation", isLoop);
        } 
    },

});
