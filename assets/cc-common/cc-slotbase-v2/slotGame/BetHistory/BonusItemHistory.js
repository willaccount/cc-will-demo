const {convertAssetArrayToObject} = require('utils');

cc.Class({
    extends: cc.Component,

    properties: {
        openSprite: [cc.SpriteFrame],
        unOpenSprite: [cc.SpriteFrame],
        static: cc.Sprite,
        value: cc.Label
    },

    onLoad() {
        this.node.setScore = this.setScore.bind(this);
        this.node.unOpen = this.unOpen.bind(this);
        this.node.setResult = this.setResult.bind(this);
        this.resultList = convertAssetArrayToObject(this.openSprite);
    },

    onStart() {
        this.static.spriteFrame = this.unOpenSprite[0];
    },

    unOpen() {
        this.static.spriteFrame = this.unOpenSprite[0];
        this.value.node.active = false;
    },

    setScore(value) {
        this.value.string = value;
        this.value.node.active = true;
    },

    setResult(spriteName, active = true) {
        this.static.spriteFrame = this.resultList[spriteName];
        this.static.node.active = active;
    }
});
