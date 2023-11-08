
cc.Class({
    extends: require('BaseViewPopup'),

    properties: {
        scrollView : cc.ScrollView,
    },

    enter() {
        this._super();
        if(this.scrollView){
            this.scrollView.scrollToTop();
        }
    },

    exit() {
        this._super();
        this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
    }
    
});
