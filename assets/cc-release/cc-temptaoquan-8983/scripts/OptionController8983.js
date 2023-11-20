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

        if (this.dimOption) {
            if (this.canClick) {
                this.dimOption.active = false;
            } else {
                this.dimOption.active = true;
            }
        }
    },

    setupOptionMessages() {
        this.node.on("START_SPINNING_MYSTERY_REELS", this.startSpinningMysteryReels, this);
        this.node.on("STOP_SPINNING_MYSTERY_REELS", this.stopSpinningMysteryReel, this);
        this.node.on("SELECT_OPTION", this.onOptionSelected, this);
        this.node.on("RESET_OPTION", this.reset, this);
    },

    onOptionSelected(isHighligth) {
        if (this.canClick) {
            this.canClick = false;
            if (!isHighligth) {
                this.dimOption.active = true;
            }
        }
    },

    callback() {
        this.winMultiplier.opacity = 255;
        this.spinAmount.opacity = 255;
        this.spinAmountReel.opacity = 0;
        this.multiplierReel.opacity = 0;
    },

    reset() {
        this.canClick = true;
        this.node.opacity = 255;
        this.dimOption.active = false;
    },

    startSpinningMysteryReels() {
        this.winMultiplier.opacity = 0;
        this.spinAmount.opacity = 0;
        this.spinAmountReel.opacity = 255;
        this.multiplierReel.opacity = 255;
        this.spinAmountReel.emit("START_REEL_SPINNING");
        this.multiplierReel.emit("START_REEL_SPINNING");
    },

    stopSpinningMysteryReel(content, callback) {
        const onComplete = () => {
            this.reset();
            callback && callback();
        }

        this.spinAmountReel.emit("STOP_REEL_SPINNING", 0, content, null);
        this.multiplierReel.emit("STOP_REEL_SPINNING", 0, content, onComplete, true);
    },
});
