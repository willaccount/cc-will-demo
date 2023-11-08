

cc.Class({
    extends: cc.Component,

    properties: {
        position: "TOP_RIGHT" //set your align here
    },

    start () {
        if (cc.sys.isBrowser && cc.sys.isMobile) {
            const loadConfigAsync = require('loadConfigAsync');
            const {LOGIN_IFRAME} = loadConfigAsync.getConfig();
            if (LOGIN_IFRAME) {
                if (this.position == "TOP_RIGHT")
                {
                    this.alignFunc = this.alignTopRight.bind(this);
                }
                else if (this.position == "BOT_LEFT") {
                    this.alignFunc = this.alignBotLeft.bind(this);
                }
                else if (this.position == "BOT_LEFT_23") {
                    this.alignFunc = this.alignBotLeft23.bind(this);
                }
                //add your align here
                if (this.alignFunc)
                {
                    this.alignFunc();
                    window.addEventListener('resize', this.alignFunc);
                }
            }
        }
    },

    alignTopRight(){
        const enterFullscreen = document.getElementById('enterFullscreen');
        const exitFullscreen = document.getElementById('exitFullscreen');

        if (window.innerWidth > window.innerHeight)
        {
            if (enterFullscreen && exitFullscreen) {
                enterFullscreen.classList.add("alignTopRight");
                enterFullscreen.classList.remove("alignBotRight");
                exitFullscreen.classList.add("alignTopRight");
                exitFullscreen.classList.remove("alignBotRight");
            }
        }
        else
        {
            if (enterFullscreen && exitFullscreen) {
                enterFullscreen.classList.add("alignBotRight");
                enterFullscreen.classList.remove("alignTopRight");
                exitFullscreen.classList.add("alignBotRight");
                exitFullscreen.classList.remove("alignTopRight");
            }
        }
    },

    alignBotLeft() {
        const enterFullscreen = document.getElementById('enterFullscreen');
        const exitFullscreen = document.getElementById('exitFullscreen');

        if (window.innerWidth > window.innerHeight)
        {
            if (enterFullscreen && exitFullscreen) {
                enterFullscreen.classList.add("alignBotLeft");
                enterFullscreen.classList.remove("alignTopLeft");
                exitFullscreen.classList.add("alignBotLeft");
                exitFullscreen.classList.remove("alignTopLeft");
            }
        }
        else
        {
            if (enterFullscreen && exitFullscreen) {
                enterFullscreen.classList.add("alignTopLeft");
                enterFullscreen.classList.remove("alignBotLeft");
                exitFullscreen.classList.add("alignTopLeft");
                exitFullscreen.classList.remove("alignBotLeft");
            }
        }
    },

    alignBotLeft23() {
        const enterFullscreen = document.getElementById('enterFullscreen');
        const exitFullscreen = document.getElementById('exitFullscreen');

        if (window.innerWidth > window.innerHeight)
        {
            if (enterFullscreen && exitFullscreen) {
                enterFullscreen.classList.add("alignBotLeft23");
                enterFullscreen.classList.remove("alignTopLeft23");
                exitFullscreen.classList.add("alignBotLeft23");
                exitFullscreen.classList.remove("alignTopLeft23");
            }
        }
        else
        {
            if (enterFullscreen && exitFullscreen) {
                enterFullscreen.classList.add("alignTopLeft23");
                enterFullscreen.classList.remove("alignBotLeft23");
                exitFullscreen.classList.add("alignTopLeft23");
                exitFullscreen.classList.remove("alignBotLeft23");
            }
        }
    },

    onDestroy()
    {
        if (cc.sys.isBrowser && cc.sys.isMobile && this.alignFunc) {
            window.removeEventListener('resize', this.alignFunc);
        }
    }
});
