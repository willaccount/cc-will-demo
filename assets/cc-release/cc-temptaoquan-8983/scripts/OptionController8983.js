const Y_START = 102;
const Y_END = -140;
const START_HEIGHT = 40;

cc.Class({
    extends: cc.Component,

    properties: {
        spinAmount: cc.Node,
        wildSpine: cc.Node,
        winMultiplier: cc.Node,
        mask: cc.Node,
        spinAmountReel: cc.Node,
        multiplierReel: cc.Node,
    },

    onLoad() {
        this.spinAmountReel.active = true;
        this.multiplierReel.active = true;
        this.spinAmountReel.opacity = 255;
        this.multiplierReel.opacity = 255;

        this.node.on("START_SPINNING_MYSTERY_REELS", this.startSpinningMysteryReels, this);
        this.node.on("STOP_SPINNING_MYSTERY_REELS", this.stopSpinningMysteryReel, this);
    },

    canClickOption(value) {
        this.canClick = value;
    },

    callback(spinAmountSprite, multiplerSprite) {
        this.winMultiplier.opacity = 255;
        this.spinAmount.opacity = 255;
        this.spinAmountReel.opacity = 0;
        this.multiplierReel.opacity = 0;
        this.spinAmount.getComponent(cc.Sprite).spriteFrame = spinAmountSprite;
        this.winMultiplier.getComponent(cc.Sprite).spriteFrame = multiplerSprite;
    },

    reset() {
        this.canClick = false;
        this.mask.height = START_HEIGHT;
        this.node.opacity = 255;
    },

    startSpinningMysteryReels() {
        this.winMultiplier.opacity = 0;
        this.spinAmount.opacity = 0;
        this.spinAmountReel.opacity = 255;
        this.multiplierReel.opacity = 255;
        this.spinAmountReel.emit('START_REEL_SPINNING');
        this.multiplierReel.emit('START_REEL_SPINNING');
    },

    stopSpinningMysteryReel(content) {
        const callback = () => {
            this.exit();
        }
        cc.log('stopSpinningMysteryReel');
        this.spinAmountReel.emit('STOP_REEL_SPINNING', 0, content, callback);
        this.multiplierReel.emit('STOP_REEL_SPINNING');
    }
});
