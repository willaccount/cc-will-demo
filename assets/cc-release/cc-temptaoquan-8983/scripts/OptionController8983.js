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
        dimOption: cc.Node,
        canClick: true,
    },

    onLoad() {
        this.setupOptionNode();

        this.setupOptionMessages();
    },

    setupOptionNode() {
        if (this.spinAmountReel && this.multiplierReel) {
            this.spinAmountReel.opacity = 0;
            this.multiplierReel.opacity = 0;
        }

        if (this.dimOpion) {
            if (this.canClick) {
                this.dimOpion.active = false;
            } else {
                this.dimOpion.active = true;
            }
        }
    },

    setupOptionMessages() {
        this.node.on("START_SPINNING_MYSTERY_REELS", this.startSpinningMysteryReels, this);
        this.node.on("STOP_SPINNING_MYSTERY_REELS", this.stopSpinningMysteryReel, this);
    },

    onOptionSelected(isSelected) {
        this.canClick = false;
        if (!isSelected && this.dimOpion) {
            this.dimOpion.active = true;
        }
    },

    callback() {
        this.winMultiplier.opacity = 255;
        this.spinAmount.opacity = 255;
        this.spinAmountReel.opacity = 0;
        this.multiplierReel.opacity = 0;
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

    stopSpinningMysteryReel(content, callback) {
        const onComplete = () => {
            this.reset();
            callback && callback();
        }

        this.spinAmountReel.emit('STOP_REEL_SPINNING', 0, content, null);
        this.multiplierReel.emit('STOP_REEL_SPINNING', 0, content, onComplete, true);
    },

    getCanClick() {
        return this.canClick;
    },
});
