

cc.Class({
    extends: cc.Component,

    properties: {
        view: cc.Node,
        content: cc.Node,
    },

    update () {
        var viewRect = cc.rect(-this.content.x - this.view.width * this.view.anchorX, -this.content.y - this.view.height * this.view.anchorY, this.view.width, this.view.height);
        for (let i = 0; i < this.content.children.length; i++) {
            const node = this.content.children[i];
            if (viewRect.intersects(node.getBoundingBox())) {
                node.opacity = 255;
            }
            else {
                node.opacity = 0;
            }
        }
    }
});
