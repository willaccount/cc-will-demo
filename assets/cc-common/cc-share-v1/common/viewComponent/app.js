

// const MobileDetect = require('mobile-detect');
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // New Tab in Web || interup to Home (Home-Key) / Lock-key in Mobile device 
        cc.game.on(cc.game.EVENT_HIDE, this.onHideApp, this);
        cc.game.on(cc.game.EVENT_SHOW, this.onShowApp, this);
    },

    start () {
        // if (window) {
        //     let isAIPhone = "";
        //     const md = new MobileDetect(window.navigator.userAgent);
        //     isAIPhone = md.phone();
            
        //     cc.log(md,"Check!~~~",isAIPhone);
        //     if ((isAIPhone == "iPhone") && 
        //         (window.innerHeight < window.innerWidth) &&
        //         (window.innerHeight != window.outerHeight) &&
        //         (window.innerWidth < 750)) {
        //         // alert("Xoay hoặc khóa máy để thấy đầy đủ trò chơi!");
        //     }
        // }
    },

    // update (dt) {},

    onDestroy () {
        cc.game.off(cc.game.EVENT_HIDE, this.onHideApp, this);
        cc.game.off(cc.game.EVENT_SHOW, this.onShowApp, this);
    },
    
    onHideApp() {
        cc.log('app.js game hide APP::PAUSE ');
    },
    onShowApp() {
        cc.log('app.js game show APP:RESUME ');
    }

});
