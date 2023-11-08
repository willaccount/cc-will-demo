

cc.Class({
    extends: cc.PageViewIndicator,

    properties: {
        unSelectedSpriteFrame: {
            default: null,
            type: cc.SpriteFrame,
        }
    },

    _changedState: function () {
        let indicators = this._indicators;
        if (indicators.length === 0) return;
        let idx = this._pageView._curPageIdx;
        if (idx >= indicators.length) return;
        for (let i = 0; i < indicators.length; ++i) {
            let node = indicators[i];
            if(node){
                let sprite = node.getComponent(cc.Sprite);
                if(sprite){
                    sprite.spriteFrame = this.unSelectedSpriteFrame;
                }
            }
        }
        this.setSpriteFrame({indicators, idx});
    },

    setSpriteFrame({indicators, idx}) {
        let node = indicators[idx];
        if(node){
            let sprite = node.getComponent(cc.Sprite);
            if(sprite){
                sprite.spriteFrame = this.spriteFrame;
            }
        }
    }
});
