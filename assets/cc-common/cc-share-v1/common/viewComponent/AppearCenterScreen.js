

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        const viewSize = cc.view.getVisibleSize();
        const newPos = this.node.convertToWorldSpaceAR(this.node.position);
        this.node.setPosition(cc.v2(viewSize.width/2 - newPos.x, viewSize.height/2 - newPos.y));
    },

});
