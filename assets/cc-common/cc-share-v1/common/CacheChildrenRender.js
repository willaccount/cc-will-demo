
cc.Class({
    extends: cc.Component,
    properties: {
        pageIndex: 1,
        isCustomView: false,
        customWidth: 720,
        customHeight: 1280,
    },

    onLoad() {
        this.positionCache = this.node.position;
        this.node.opacity = 0;
        this.node.x = 3000;
        this.camera = this.node.addComponent(cc.Camera);
        this.camera.cullingMask = this.node._cullingMask;
        this.node.children.forEach(child => {
            child.group = this.node.group;
        });
    },

    start() {
        this.scheduleOnce(() => {
            this.node.opacity = 255;
            const renderTexture = new cc.RenderTexture();
            if (!this.isCustomView) {
                renderTexture.initWithSize(cc.winSize.width, cc.winSize.height);
            } else {
                renderTexture.initWithSize(this.customWidth, this.customHeight);
            }
            this.camera.targetTexture = renderTexture;
            this.camera.render(this.node);
            let spriteFrame = new cc.SpriteFrame(renderTexture);

            let sprieComp = this.node.getComponent(cc.Sprite);
            if (!sprieComp) sprieComp = this.node.addComponent(cc.Sprite);
            sprieComp.spriteFrame = spriteFrame;

            this.node.removeAllChildren();
            this.node.scaleY = -1;
            this.node.removeComponent(cc.Camera);
            this.node.position = this.positionCache;
        }, Number(0.017 * (this.pageIndex > 0 ? this.pageIndex : 1)));
    },

});