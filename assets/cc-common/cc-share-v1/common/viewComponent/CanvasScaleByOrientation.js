

cc.Class({
    extends: cc.Component,

    properties: {
        autoOrientation: false,
        isPortrait: true,
        canvas: cc.Canvas,
        fitByOrientation: true,
        useCustomDesignResolution: false,
        customDSWidth: 1280,
        customDSHeight: 720,
        widgetNodes: {
            type: cc.Widget,
            default: [],
        },
        isDebug: false
    },

    onLoad() {
        this._thisOnResized = this.onScreenResized.bind(this);
        if (cc.sys.isMobile) {
            window.addEventListener('resize', this._thisOnResized);
        }
        else {
            cc.view.on('canvas-resize', this._thisOnResized);
        }
        this.scaleCanvasByOrientation();
        if (!cc.sys.isNative) {
            var divFullscreen = document.getElementById('div_full_screen');
            if (this.isPortrait) {
                if (divFullscreen) {
                    divFullscreen.style.visibility = "hidden";
                }
            }

            if(this.autoOrientation){
                cc.view.setOrientation(cc.macro.ORIENTATION_AUTO);
            }else if(this.isPortrait){
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            }else{
                cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            }
        }
    },

    start(){
        if(cc.sys.isMobile){
            const eventResize = new Event('gameShow');
            window.dispatchEvent(eventResize);
        }
        this.updateForLandscape();
    }, 

    updateForLandscape() {
        const vjsb = window['vjsb'];
        if (vjsb && cc.sys.os == cc.sys.OS_ANDROID && !this.isPortrait) {
            this.node.rotation = 90;
            let fs = cc.view.getFrameSize();
            this.node.scaleY = fs.height/fs.width;
            this.node.scaleX = this.node.scaleY;
        }
    },

    scaleCanvasByOrientation() {
        if (this.autoOrientation) {
            if (cc.view.getFrameSize().width < cc.view.getFrameSize().height) {
                this.isPortrait = true;
            } else {
                this.isPortrait = false;
            }
        } else {
            if (this.isPortrait) {
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            } else {
                cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            }
        }

        if (this.canvas) {
            this.isDebug && cc.log("Canvas after update: ");
            this.isDebug && cc.log(this.canvas);

            this.canvas.alignWithScreen();
            if (this.fitByOrientation) {
                const loadConfigAsync = require('loadConfigAsync');
                const {LOGIN_IFRAME} = loadConfigAsync.getConfig();

                const designRatio = this.useCustomDesignResolution && LOGIN_IFRAME ? this.customDSWidth/this.customDSHeight : this.canvas.designResolution.width / this.canvas.designResolution.height;
                const frameSize = cc.view.getFrameSize();
                const isLandscape = this.isLandscapeScreen();
                let screenRatio = frameSize.width / frameSize.height;
                this.isDebug && cc.log(`View size:${frameSize}, Design Resolution: W: ${this.canvas.designResolution.width}, H: ${this.canvas.designResolution.height},  Screen Ratio: ${screenRatio}, Design Ratio: ${designRatio}`);
                if (this.isPortrait) {
                    const windowRatio = (!isLandscape)? (window.innerWidth / window.innerHeight) : (window.innerHeight / window.innerWidth);
                    screenRatio = (cc.sys.isMobile && cc.sys.isBrowser && windowRatio < screenRatio)? windowRatio : screenRatio;
                    if (screenRatio < designRatio) {
                        this.canvas.fitHeight = false;
                        this.canvas.fitWidth = true;
                        this.isDebug && cc.log(`CANVAS FIT WIDTH`);
                    } else {
                        this.canvas.fitHeight = true;
                        this.canvas.fitWidth = false;
                        this.isDebug && cc.log(`CANVAS FIT HEIGHT`);
                    }
                    this.rotateRootPortraitGame();
                } else {
                    const windowRatio = isLandscape? (window.innerWidth / window.innerHeight) : (window.innerHeight / window.innerWidth);
                    screenRatio = (cc.sys.isMobile && cc.sys.isBrowser && windowRatio > screenRatio)? windowRatio : screenRatio;
                    if (screenRatio < designRatio) {
                        this.canvas.fitHeight = false;
                        this.canvas.fitWidth = true;
                        this.isDebug && cc.log(isLandscape? `LANDSCAPE ORIENTATION - CANVAS FIT WIDTH` : `PORTRAIT ORIENTATION - CANVAS FIT WIDTH`);
                    } else {
                        this.canvas.fitHeight = true;
                        this.canvas.fitWidth = false;
                        this.isDebug && cc.log(isLandscape? `LANDSCAPE ORIENTATION - CANVAS FIT HEIGHT` : `PORTRAIT ORIENTATION - CANVAS FIT HEIGHT`);
                    }
                }
            }
        } else {
            this.isDebug && cc.log(`No canvas component`);
        }

        if (this.widgetNodes && this.widgetNodes.length > 0) {
            for (let i = 0; i < this.widgetNodes.length; i++) {
                this.widgetNodes[i].updateAlignment();
            }
        }
    },

    rotateRootPortraitGame() {
        if (!this.isPortrait) return;
        if (cc.sys.isMobile && cc.sys.isBrowser) {
            const isLandScapeView = this.isLandscapeScreen();
            this.node.children.forEach(child => {
                if (!child.getComponent(cc.Camera)) {
                    child.angle = isLandScapeView ? 180 : 0;
                }
            });
        }
    },

    onScreenResized() {
        this.scaleCanvasCallback = ()=> {
            this.scaleCanvasByOrientation();
            this.scaleCanvasCallback = null;
        };
        this.scheduleOnce(this.scaleCanvasCallback, 0.5);
    },

    onDestroy() {
        if (cc.sys.isMobile) {
            window.removeEventListener('resize', this._thisOnResized);
        }
        else {
            cc.view.off('canvas-resize', this._thisOnResized);
        }
        if(this.scaleCanvasCallback) this.unschedule(this.scaleCanvasCallback);
        this.scaleCanvasCallback = null;
    },

    isLandscapeScreen() {
        if(cc.sys.isBrowser && cc.sys.isMobile && typeof window.matchMedia === 'function') {
            if (window.matchMedia("(orientation: landscape)").matches) {
                return true;
            }
            if (window.matchMedia("(orientation: portrait)").matches) {
                return false;
            }
        }
        return true;
    },
});
