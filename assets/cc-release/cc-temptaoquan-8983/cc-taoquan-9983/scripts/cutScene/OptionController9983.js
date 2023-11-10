const Y_START = 102;
const Y_END = -140;
const START_HEIGHT = 40;

cc.Class({
    extends: cc.Component,

    properties: {
        spinNumber: cc.Node,
        wildSpine: cc.Node,
        wildMultiply: cc.Node,
        background: cc.Node,
        scrollTop: cc.Node,
        scrollBottom: cc.Node,
        mask: cc.Node,
        topMysteryChoice: cc.Node,
        botMysteryChoice: cc.Node,
    },

    onLoad () {
        this.node.on("UPDATE_OPTION_DATA", this.updateData, this);
        this.node.on("SCROLLING_ROLL", this.playRollAnimation, this);
        this.node.on("RESET_DATA", this.reset, this);
        this.node.on('INIT_MYSTERY', this.initMystery, this);
        this.node.on('RESET_MYSTERY', this.resetMystery, this);
        this.node.on('ROLL_MYSTERY', this.rollMystery, this);
        this.node.on('STOP_MYSTERY', this.stopMystery, this);
        this.node.on('CAN_CLICK', this.canClickOption, this);
        if (this.wildSpine) {
            this.wildSpine.active = false;
        }
        this.topMysteryChoice.active = false;
        this.botMysteryChoice.active = false;
    },

    canClickOption(value){
        this.canClick = value;
    },

    attachEvent(data, selectOptionCallback) {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "OptionController9983";
        clickEventHandler.handler = "callback";
        this.data = data;
        this.selectOptionCallback = selectOptionCallback;

        var button = this.node.getComponent(cc.Button);
        button.clickEvents.push(clickEventHandler);
    },

    callback () {
        if(!this.canClick) return;
        this.canClick = false;
        this.wildSpine.active = true;
        this.wildSpine.getComponent(sp.Skeleton).setAnimation(0, 'animation', false);
        this.selectOptionCallback(this.data);
    },

    updateData({spinNumber, index, wildMultiply, background, scroll, spinImageList, wildMultiplyImageList}) {
        this.background.getComponent(cc.Sprite).spriteFrame = background;
        this.spinNumber.getComponent(cc.Sprite).spriteFrame = spinNumber;
        this.wildMultiply.getComponent(cc.Sprite).spriteFrame = wildMultiply;
        this.scrollTop.getComponent(cc.Sprite).spriteFrame = scroll;
        this.scrollBottom.getComponent(cc.Sprite).spriteFrame = scroll;
        this.wildSpine.getComponent(sp.Skeleton).setSkin(`skin${index}`);
        this.wildSpine.getComponent(sp.Skeleton).setSlotsToSetupPose();
        this.index = index;
        if(index == 7) {
            this.topMysteryChoice.active = true;
            this.botMysteryChoice.active = true;
            this.initMystery(spinImageList, wildMultiplyImageList);
        }
    },

    playRollAnimation() {
        this.tweenMask = cc.tween(this.mask).to(0.8, {height: this.background.height});
        this.tweenMask.start();
        this.scrollBottom.runAction(cc.moveTo(0.8, cc.v2(this.scrollBottom.x, Y_END)));
    },

    reset() {
        this.canClick = false;
        this.mask.height = START_HEIGHT;
        this.scrollTop.y = -Y_END;
        this.scrollBottom.y = Y_START;
        this.node.opacity = 255;
        this.wildSpine.active = false;
        this.wildSpine.getComponent(sp.Skeleton).clearTracks();
    },

    initMystery(topSymbols, botSymbols){
        this.topMysteryChoice.emit('INIT', topSymbols);
        this.botMysteryChoice.emit('INIT', botSymbols);
    },

    rollMystery(){
        if(this.index != 7) return;
        this.topMysteryChoice.emit('MYSTERY_CHOICE');
        this.botMysteryChoice.emit('MYSTERY_CHOICE');
    },

    resetMystery(){
        this.topMysteryChoice.emit('RESET');
        this.botMysteryChoice.emit('RESET');
    },

    stopMystery(multiId, spinTimeId, callback){
        this.topMysteryChoice.emit('STOP_ROLL', spinTimeId);
        this.botMysteryChoice.emit('STOP_ROLL', multiId, callback);
    }
});
