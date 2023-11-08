
cc.Class({
    extends: cc.Component,

    onLoad() {
        this._thisOnResized = this.onScreenResized.bind(this);
        if (cc.sys.isMobile) {
            window.addEventListener('resize', this._thisOnResized);
        }
        else {
            cc.view.on('canvas-resize', this._thisOnResized);
        }

        this.scaleCanvasByOrientation();
    },

    scaleCanvasByOrientation() {
        let widthBackground = 960;
        let heightBackground = 640;

        // let isPortrait = false;
        // if (widthView > heightView) {
        //     isPortrait = false; // landscape
        // } else {
        //     isPortrait = true;
        // }

        let heightDefaultCanvas = 1280;
        let widthView = cc.view.getFrameSize().width;
        let heightView = cc.view.getFrameSize().height;

        let scaleHeightDevice = heightView / heightDefaultCanvas;
        let scaleWidthDevice = widthView/ heightDefaultCanvas;

        let realScaleDevice = scaleHeightDevice > scaleWidthDevice ? scaleWidthDevice : scaleHeightDevice;

        let convertWithBG = widthBackground * realScaleDevice;
        let convertHeightBG = heightBackground * realScaleDevice;
        
        let ratioW = widthView / convertWithBG;
        let ratioH = heightView / convertHeightBG;

        if (ratioW > ratioH) this.node.scale = ratioW;
        else this.node.scale = ratioH;
    },

    onDestroy() {
        if (cc.sys.isMobile) {
            window.removeEventListener('resize', this._thisOnResized);
        }
        else {
            cc.view.off('canvas-resize', this._thisOnResized);
        }
    },

    onScreenResized() {
        this.scaleCanvasByOrientation();
    },
});
