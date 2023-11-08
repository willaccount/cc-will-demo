/* global Sentry */

const gameNetwork = window.GameNetwork || require('game-network');
const MessageManager = gameNetwork.MessageManager;
const messageManager = MessageManager.getInstance();
const ServiceRest = gameNetwork.ServiceRest;
const serviceRest = ServiceRest.getInstance('cc');
const logger = gameNetwork.lib.logger;

function globalNetworkV3() {
    this.gamesData = {};
    this.token = null;
    this.init = (token, envId = 'portal', gameIdSocket = 'all') => {
        cc.log("Network using V3");
        this.token = token;
        const loadConfigAsync = require('loadConfigAsync');
        const {SOCKET_URL, API_URL} = loadConfigAsync.getConfig();
        const deviceInfo = {
            os: cc.sys.os,
            osVersion: cc.sys.osVersion,
            platform: cc.sys.platform,
            browser: cc.sys.browserType,
            browserVersion: cc.sys.browserVersion,
            language: cc.sys.language
        };
        logger.updateLogger(cc.log, cc.log, cc.warn);
        messageManager.initSocket({
            socketUrl: SOCKET_URL,
            token,
            apiUrl: API_URL,
            urlVerifyToken: 'auth/token/login',
            games: gameIdSocket,
            env: envId,
            device: deviceInfo,
            serviceRest,
        });
        loadConfigAsync.setUpSentry();
    };

    this.getToken = ()=>{
        return this.token;
    };

    this.registerGame = (gameData) => {
        const {
            gameId, isSlotGame,
        } = gameData;
        let gameState;
        if (typeof Sentry !== 'undefined') {
            Sentry.configureScope(function(scope) {
                scope.setExtra("gameId", gameId);
            });
        }
        if (isSlotGame) {
            gameState = require('gameStateSlot');
        } else {
            gameState = require('gameState' + gameId);
        }
        if (!gameState) return;

        return new gameState({gameData});
    };

    this.triggerUserLogout = () => {
        messageManager.closeAndCleanUp();
    };

    this.outGame = () => {};
}

module.exports = globalNetworkV3;
