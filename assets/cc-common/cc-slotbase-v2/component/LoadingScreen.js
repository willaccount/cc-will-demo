

const {registerLoadHowl, unregisterLoadHowl} = require('utils');
cc.Class({
    extends: cc.Component,
    properties: {
        sceneName: '',
        sdSceneName: '',
        sceneNameIframe: '',
        sceneNameHistory: '',
        processBar: cc.Node,
        loadingBG: cc.Node,
        barWidth: 0,
        loadingGlow: cc.Node,
        homeBtn: cc.Node,
        percentLabel: cc.Label
    },
    onLoad() {
        this.customInitLang();
        if (this.sceneName === '') return;
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGIN_IFRAME} = loadConfigAsync.getConfig();
        const {handleFlowOutGame, handleCloseGameIframe} = require("gameCommonUtils");
        let sceneName = this.sceneName;
         
        if (cc.sys.isBrowser) {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const history = urlParams.get('history');
            // var language = urlParams.get('l');
            // var currency = urlParams.get('c');
            // language = language ? language.toUpperCase() : null;
            // currency = currency ? currency.toUpperCase() : null;
                //`${language}-${currency}`;
            const extName = cc.director.getScene().name.split('-');
            let extSceneName = null;
            if (extName.length>= 3) {
                extSceneName = extName[1] + '-' + extName[2];
            }
            if (this.sceneNameHistory && history) {
                sceneName = this.sceneNameHistory;
            } else if (this.sceneNameIframe) {
                sceneName = this.sceneNameIframe;
            }
            if (extSceneName) {
                let redirectScene = `${sceneName}-${extSceneName}`;
                let sceneList = cc.game._sceneInfos.map(scene => scene.url);
                for (let i=0; i <sceneList.length; i++) {
                    if (sceneList[i].indexOf(redirectScene) > -1) {
                        sceneName = `${sceneName}-${extSceneName}`;
                        break;
                    }
                }
            }
        }

        if (LOGIN_IFRAME && window.Howl) {
            this.switchHowlLoader = true;
            registerLoadHowl();
        }

        if (cc.sys.isMobile && this.sdSceneName) {
            sceneName = this.sdSceneName;
        }

        if (this.homeBtn) {
            this.homeBtn.active = false;

            if (!LOGIN_IFRAME) {
                this.node.runAction(cc.sequence(
                    cc.delayTime(10),
                    cc.callFunc(() => {
                        this.homeBtn.active = true;
                        this.homeBtn.off('click');
                        this.homeBtn.on('click', () => {
                            if (this.isBackToLobby) return;
                            let eventHandler = this.node.getComponent("KtekEventHandler");
                            if( eventHandler ){
                                eventHandler.getInstance().sendToUs("clear_cache", {
                                    scene: sceneName
                                });
                            }
                            handleCloseGameIframe();
                            this.isBackToLobby = true;
                        });
                    })
                ));
            }
        }
        this.node.active = true;
        this.node.opacity = 255;

        this.updatedScene = sceneName;
        this.preloadGameScene = true;
        this.isLoadingCompleted = false;
        this.progressBarComp = this.processBar.getComponent(cc.ProgressBar);
        this.progressBarComp.progress = 0;
        if (this.percentLabel) {
            this.percentLabel.string = '0%';
        }
        
        cc.director.preloadScene(sceneName, (completedCount, totalCount) => {
            if (totalCount > 0) {
                this.totalPercent = completedCount / totalCount;
            }
        },(error) => {
            if (error) {
                handleFlowOutGame();
            } else {
                this.isLoadingCompleted = true;
            }
        });
    },

    update() {
        if (this.preloadGameScene && this.progressBarComp && this.totalPercent > 0) {
            let percent = (this.totalPercent - this.progressBarComp.progress) / 20;
            if (percent > 0) {
                this.progressBarComp.progress += percent;
                if (this.loadingGlow) {
                    this.loadingGlow.x = Math.max(this.loadingGlow.x, this.barWidth * this.progressBarComp.progress);
                }
                if (this.percentLabel) {
                    this.percentLabel.string = `${Math.ceil(this.progressBarComp.progress * 100)}%`;
                }
            }
            if (this.progressBarComp.progress > 0.99 && this.isLoadingCompleted) {
                this.isLoadingCompleted = false;
                this.preloadGameScene = false;
                let delayTime = this.isSlowLoading ? 15 : 0;
                this.node.runAction(cc.sequence(cc.delayTime(delayTime), cc.callFunc(()=>{
                    cc.director.loadScene(this.updatedScene);
                })));
                if (this.percentLabel) {
                    this.percentLabel.string = '100%';
                }
            }
        }
    },

    customInitLang() {
        // init for fish language
    },

    setSlowLoading(val) {
        this.isSlowLoading = val;
    },

    onDisable() {
        this.node.stopAllActions();
    },

    onDestroy() {
        if (this.switchHowlLoader) {
            unregisterLoadHowl();
        }
    }
});
