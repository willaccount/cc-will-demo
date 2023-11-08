

cc.Class({
    extends: cc.Component,

    properties: {
        startSize: 0,
        maxSize: 1.2,
        minSize: 0.8,
        target: cc.Node
    },

    spawn(text) {
        this.node.active = true;
        this.target.getComponent(cc.Label).string = `x${text}`;
        this.target.scaleX = this.startSize;
        this.target.scaleY = this.startSize;
        this.target.runAction(cc.sequence(cc.scaleTo(0.5, this.maxSize, this.maxSize), cc.callFunc(()=>{
            this.target.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.4, this.minSize, this.minSize), cc.scaleTo(0.4, this.maxSize, this.maxSize))));
        })));
    },
});
