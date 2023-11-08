

const connect = require('connectNetwork');
cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad() {
        this.node.index = this;
        this._updateLanguageConfig();
    },
    start() {
        if (!this || !this.node || !this.node.director) return;
        this.gameId = this.node.config.GAME_ID;
        this.node.gSlotDataStore.gameId = this.gameId;
        this.node.director.init();
        this.connect();
        this._isOnStarted = false;
    },

    update(){
        if(!this._isOnStarted){
            this._isOnStarted = true;
            this.node.director.initGameMode();
        }
    },
    connect() {
        const autoConnect = new connect();
        autoConnect.loginScene({
            callback: this.init.bind(this),
            gameId: this.gameId,
            gameNode: this.node,
            callbackAuthFailed: this.authFailed.bind(this)
        });
    },
    init() {
        if (!this || !this.node || !this.node.director) return;
        this.node.director.setUpGame();
            
    },
    authFailed() {
        if (!this || !this.node || !this.node.director) return;
        this.node.director.showMessageAuthFailed();
    },
    _updateLanguageConfig() {
        this.languageCode = this._getLanguage();
        window.languageCode = this.languageCode;
    },
    _getLanguage() {
        const { getUrlParam } = require("gameCommonUtils");
        const loadConfigAsync = require('loadConfigAsync');
        const { LOGIN_IFRAME } = loadConfigAsync.getConfig();
        const defaultLanguage = window.defaultLanguage || 'VI';
        let language = '';
        if (LOGIN_IFRAME) {
            language = getUrlParam('l') || defaultLanguage;
        } else {
            language = cc.sys.localStorage.getItem('l') || defaultLanguage;
        }
        return language.toUpperCase();
    },
    onDestroy() {
        if (cc.sys.isNative && typeof(closeCreatorGame) !== 'function') {
            cc.audioEngine.stopAll();
        }
        if (this.node.director && this.node.director.gameStateManager) {
            this.node.director.gameStateManager.outGame();
        }
    },
});
