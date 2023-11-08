

const MobileDetect = require('mobile-detect');
cc.Class({
    extends: cc.Component,
    properties: {
        sceneName: "",
        sceneNamePortrait: "",
    },
    onLoad() {
        if (this.sceneName === "") return;
        let isPhone = false;
        if ((cc.sys.platform == cc.sys.DESKTOP_BROWSER || cc.sys.platform == cc.sys.MOBILE_BROWSER) && window) {
            const md = new MobileDetect(window.navigator.userAgent);
            isPhone = md.phone();
            cc.log(md);
        }
        let sceneGame = this.sceneName;
        cc.log(cc.sys.isMobile , isPhone);
        if (cc.sys.isMobile && isPhone && this.sceneNamePortrait != "") {
            sceneGame = this.sceneNamePortrait;
        }

        cc.director.loadScene(sceneGame);
    },
});
