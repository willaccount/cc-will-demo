

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        const viewSize = cc.view.getVisibleSize();
        const ratio = (viewSize.height/viewSize.width);
        const canvas = this.node.getComponent(cc.Canvas);
        if (ratio <= 0.5625)
        {
            canvas.fitWidth = false;
            canvas.fitHeight = true;
        }
        else
        {
            canvas.fitWidth = true;
            canvas.fitHeight = false;
        }
    },

});
