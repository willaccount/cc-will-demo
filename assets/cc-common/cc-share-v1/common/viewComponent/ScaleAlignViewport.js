

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        const viewSize = cc.view.getVisibleSize();
        const ratioX = viewSize.height/this.node.height;
        const ratioY = viewSize.width/this.node.width;
        if (ratioX > ratioY) {
            this.node.scale = ratioX;
        } else {
            this.node.scale = ratioY;
        }
    },

});
