
cc.Class({
    extends: cc.Component,

    properties: {
        listSprites : [cc.Sprite]
    },

    onLoad() {
        this.node.on('SHOW_SMALL_TOOL_TIP', this.showSmallToolTip.bind(this));
    },
    
    showSmallToolTip(listFrames = []) {
        
        const minLength = listFrames.length < this.listSprites.length ? listFrames.length : this.listSprites.length;
        if (minLength == 0) return;
        this.listSprites.forEach(it => { it.node.active = false;});
        for(let i = 0 ; i < minLength ; i++) {
            this.listSprites[i].spriteFrame = listFrames[i];
            this.listSprites[i].node.active = true;
        }
        this.node.opacity = 255;
        this.node.scale = 1;
        if (this.tween) this.tween.stop();
        this.tween = cc.tween(this.node);
        this.tween
            .to(0.1, { scale: 1.2 })
            .to(0.1, { scale: 1 })
            .delay(2)
            .to(0.5, { opacity: 0 })
            .start();
    },
});
