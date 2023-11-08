

cc.Class({
    extends: cc.Component,

    properties: {
        maxWidth: 1440,
        maxHeight: 2436,
        maxAlignByOrient: false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._thisOnResized = this.onScreenResized.bind(this);
        if (cc.sys.isMobile) {
            window.addEventListener('resize', this._thisOnResized);
        }
        else {
            cc.view.on('canvas-resize', this._thisOnResized);
        }
        this._widget = this.node.getComponent(cc.Widget);
    },

    start () {
        this.onScreenResized();
    },

    onScreenResized(){
        if(this.node){
            let visibleViewSize = cc.view.getVisibleSize();
            // cc.log(`Visible size: ${visibleViewSize}`);
            if(this._widget!=null){
                this._widget.enabled = true;
                this._widget.updateAlignment();
            }else{
                this._widget = this.node.getComponent(cc.Widget);
            }
            
    
            if(visibleViewSize.width>this.maxWidth){
                if(this._widget!=null){
                    this._widget.enabled = false;
                }

                this.node.width = this.maxWidth;
                // cc.log(`Align with Max Width`);
            }
    
            if(visibleViewSize.height > this.maxHeight){
                if(this._widget!=null){
                    this._widget.enabled = false;
                }

                this.node.height = this.maxHeight;
                cc.log(`Align with Max Height`);
            }

            if (this.maxAlignByOrient) {
                if (this.node.height >= this.node.width * 3 / 4) {
                    if(this._widget!=null){
                        this._widget.enabled = false;
                    }
                    this.node.height = this.node.width * 3 / 4;
                }
            }
        }
        
    },

    onDestroy(){
        if (cc.sys.isMobile) {
            window.removeEventListener('resize', this._thisOnResized);
        }
        else {
            cc.view.off('canvas-resize', this._thisOnResized);
        }
    },
});
