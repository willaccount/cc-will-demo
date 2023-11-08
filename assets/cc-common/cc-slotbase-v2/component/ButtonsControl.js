

cc.Class({
    extends: cc.Component,

    properties: {
        buttons: {
            default: [],
            type: cc.Node,
        },
    },
    onLoad() {
        this.node.on("ENABLE_BUTTONS",this.enable,this);
        this.node.on("DISABLE_BUTTONS",this.disable,this);
        // this.node..ru
    },
    enable() {
        if (this.buttons && this.buttons.length) {
            this.buttons.map((btn) => {
                if (btn) btn.getComponent(cc.Button).interactable = true;
            });
        }
    },
    disable() {
        if (this.buttons && this.buttons.length) {
            this.buttons.map((btn) => {
                if (btn) btn.getComponent(cc.Button).interactable = false;
            });
        }
    },
});
