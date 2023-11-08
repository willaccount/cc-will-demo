

cc.Class({
    extends: cc.Component,
    properties: {
        lobbySceneName: "lobby",
    },
    onLoad() {
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGIN_IFRAME} = loadConfigAsync.getConfig();
        if (LOGIN_IFRAME) {
            const gameCommonUtils = require('gameCommonUtils');
            const isEnableBtn = gameCommonUtils.checkConditionCloseGameIframe();
            if (!isEnableBtn) {
                const button = this.node.getChildByName('Button');
                if (button) {
                    button.active = false;
                }
            }
        } else {
            this.node.on("BACK_TO_LOBBY",this.trigger,this);
        }
    },
    trigger() {
        if (this.node.mainDirector && this.node.mainDirector.director.waitingScene) {
            this.node.mainDirector.director.showWaitingCutScene();
        }
        if (this.node.soundPlayer && !this._backToLobbyCallback) {
            this.node.soundPlayer.playSFXClick();
        }
        if (this._backToLobbyCallback) {
            this.unschedule(this._backToLobbyCallback);
            this._backToLobbyCallback = null;
        }
        const delaySoundClick = 0.1;
        this._backToLobbyCallback = () => {
            this._backToLobbyCallback = null;
            if (cc.sys.isNative && typeof(closeCreatorGame) === 'function') {
                //
            } else {
                if (this.node.soundPlayer) {
                    this.node.soundPlayer.stopAllAudio();
                }
            }
            const gameCommonUtils = require('gameCommonUtils');
            gameCommonUtils.handleCloseGameIframe();
        };
        if (cc.sys.isNative && typeof(closeCreatorGame) === 'function') {
            this._backToLobbyCallback();
        } else {
            this.scheduleOnce(this._backToLobbyCallback, delaySoundClick);
        }
    },
});