const TweenView = require('TweenView');
cc.Class({
    extends: TweenView,

    properties: {
        movingGroup: cc.Node,
    },

    show(onStartCB = null, onCompleteCB = null) {
        if(this.movingGroup){
            this.movingGroup.show();
        }
        this._super(onStartCB, onCompleteCB);
    },

    hide(onStartCB = null, onCompleteCB = null) {
        if(this.movingGroup){
            this.movingGroup.hide();
        }
        this._super(onStartCB, onCompleteCB);
    },
});
