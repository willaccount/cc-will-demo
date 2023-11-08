

cc.Class({
    extends: cc.Component,

    properties: {
        staticNode: cc.Node,
        symbolNode: cc.Node,
        labelScore: cc.Node,
        spriteSymbols: {
            default: [],
            type: cc.SpriteFrame
        },
    },

    onLoad() {
        this.node.itemController = this;
        this.node.isOpen = false;
        this.mapValue = {
            100: 1,
            200: 2,
            400: 3,
        };
        this.node.disableClick = this.disableClick.bind(this);
        this.node.enableClick = this.enableClick.bind(this);
        this.node.showScore = this.showScore.bind(this);
    },

    start() {
        // effect idle
    },

    onClickItem(e, isAutoTrigger = false) {
        this.clickItemEvent = new cc.Event.EventCustom('CLICK_ITEM', true);
        this.clickItemEvent.setUserData({isAutoTrigger});
        this.node.dispatchEvent(this.clickItemEvent);
    },

    /**
     * @shaking_node
     * @override-for-change-anim
     **/
    playAnimClick() {
        if (!this.tweenClick) {
            this.tweenClick = cc.tween(this.node)
                .repeatForever(
                    cc.tween(this.node)
                        .by(0.02, {position: cc.v2(-10, 0)})
                        .by(0.02, {position: cc.v2(10, 0)})
                        .by(0.02, {position: cc.v2(10, 0)})
                        .by(0.02, {position: cc.v2(-10, 0)})
                );
        }
        this.tweenClick.start();
    },

    /**
     * @override-for-implement-anim
     * just hide static and show symbol
     **/
    playAnimOpen(value, callback) {
        this.node.isOpen = true;
        cc.tween(this.node)
            .delay(0.5)
            // tat rung
            .call(() => {
                // stop shaking
                if (this.tweenClick)
                    this.tweenClick.stop();

                this.staticNode.opacity = 0;
                let indexSprite = this.mapValue[value];
                this.symbolNode.getComponent(cc.Sprite).spriteFrame = this.spriteSymbols[indexSprite];
                this.symbolNode.opacity = 255;
            })
            // show ket qua
            .call(() => {
                this.showScore(value);
            })
            .delay(0.5)
            .call(() => {
                if (callback && typeof callback === 'function') {
                    callback();
                }
            })
            .start();
    },

    showScore(value) {
        this.labelScore.getComponent(cc.Label).string = 'x' + (value || 0);
    },

    setScore(value) {
        this.symbolNode.active = false;
        this.labelScore.getComponent(cc.Label).string = 'x' + (value || 0);
        this.labelScore.opacity = 255;
    },

    enableClick() {
        this.node.getComponent(cc.Button).interactable = true;
    },

    disableClick() {
        this.node.getComponent(cc.Button).interactable = false;
    },

    resetItem() {
        this.symbolNode.opacity = 0;
        this.staticNode.opacity = 255;
        this.node.opacity = 255;
        this.node.isOpen = false;
        this.labelScore.getComponent(cc.Label).string = "";
        this.enableClick();
    }

});
