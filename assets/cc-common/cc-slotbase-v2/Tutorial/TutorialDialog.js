cc.Class({
    extends: cc.Component,

    properties: {
        title: cc.Label,
        content: cc.Label,
        arrow: cc.Node,
        arrow1: cc.Node
    },

    onLoad() {
        if (this.arrow1) {
            this.arrow1.active = false;
        }
        if (this.arrow) {
            this.arrow.active = false;
        }
    },

    show(title, content, arrow, arrow1)
    {
        this.title.string = title;
        this.content.string = content;
        this.node.active = true;
        if (!arrow) this.arrow.active = false;
        else
        {
            this.arrow.active = true;
            this.arrow.scaleX = arrow.scaleX || 1;
            this.arrow.scaleY = arrow.scaleY || 1;
            this.arrow.angle = arrow.angle || 0;
            this.arrow.position = {x: arrow.x, y: arrow.y};
        }
        if (this.arrow1) {
            this.arrow1.active = false;
            if (arrow1) {
                this.arrow1.active = true;
                this.arrow1.scaleX = arrow1.scaleX || 1;
                this.arrow1.scaleY = arrow1.scaleY || 1;
                this.arrow1.angle = arrow1.angle || 0;
                this.arrow1.position = {x: arrow1.x, y: arrow1.y};
            }
        }
    },

    hide()
    {
        this.node.active = false;
    }
});
