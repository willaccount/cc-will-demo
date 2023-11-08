

cc.Class({
    extends: cc.Component,

    properties: 
    {
    },
    onLoad() {
        this.node.gSlotMiniGameScript = this;
    },
    attachEvent(data, callbackMiniGame) {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "gSlotMiniGameScript";
        clickEventHandler.handler = "callback";
        // clickEventHandler.customEventData = "foobar";
        this.data = data;
        this.callbackMiniGame = callbackMiniGame;

        var button = this.node.getComponent(cc.Button);
        button.clickEvents.push(clickEventHandler);
    },

    callback () {
        this.callbackMiniGame(this.data);
    },
});
