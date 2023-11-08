

cc.Class({
    extends: cc.Component,
    properties: {
        spriteActive: {
            type: cc.SpriteFrame,
            default: null
        },
        spriteInactive: {
            type: cc.SpriteFrame,
            default: null
        },
    },
    check(){
        this.getComponent(cc.Sprite).spriteFrame = this.spriteActive;
    },
    uncheck(){
        this.getComponent(cc.Sprite).spriteFrame = this.spriteInactive;
    }
});
