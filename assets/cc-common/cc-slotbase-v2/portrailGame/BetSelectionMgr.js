
cc.Class({
    extends: cc.Component,

    properties: {
        overlay : cc.Node,
        betSelectionPanel : cc.Node
    },

    onLoad() {
        this.node.show = this.show.bind(this);
        this.node.hide = this.hide.bind(this);
        this.node.on("SHOW", this.show, this);
        this.node.on("HIDE", this.hide, this);
    },

    start(){
        this.overlay.active = false;
        this.betSelectionPanel.active = false;
        this.node.isShowing = false;
    },

    show(onCallBackStart = null, onCallBackEnd = null) {
        this.node.isShowing = true;
        this.overlay.active = true;
        this.betSelectionPanel.active = true;
        this.betSelectionPanel.emit('UPDATE_VALUE');
        this.overlay.show(0, () => {
            this.betSelectionPanel.opacity = 255;
            this.betSelectionPanel.show(onCallBackStart, onCallBackEnd);
        });
    },

    hide() {
        this.node.isShowing = false;
        this.betSelectionPanel.hide(0, ()=>{
            this.betSelectionPanel.emit('CLEAR_ALL_BET');
            this.betSelectionPanel.opacity = 0;
            this.overlay.hide(0, ()=>{
                this.overlay.active = false;
            });
        });
        
    },
});
