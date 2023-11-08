/* global closeCreatorGame */

const lodash = require('lodash');
const {setDeviceOrientation} = require('utils');
const i18n = require('LanguageData');

function gameCommonUtils() {

    const getUrlParam = (name) => {
        if (cc.sys.isNative) return null;
        const url = new URL(window.location);
        return url.searchParams.get(name);
    };

    const addUrlParam= (key, value) => {
        if (cc.sys.isNative) return null;
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, '', url);
    };

    const checkConditionCloseGameIframe  = () => {
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGIN_IFRAME} = loadConfigAsync.getConfig();
        if  (!LOGIN_IFRAME) {
            return true;
        }
        const returnUrl = getUrlParam('ru');
        return (returnUrl && LOGIN_IFRAME);
    };

    const handleBackLobbyNativeClient = () => {
        if (cc.sys.isNative) {
            let vjsb = window['vjsb'];
            if (typeof(closeCreatorGame) === 'function') {
                if (!cc.isCallCloseCreator) {
                    closeCreatorGame();
                    //@ts-ignore
                    if (middleware && middleware.MiddlewareManager && cc.sys.os === cc.sys.OS_ANDROID) {
                        middleware.MiddlewareManager.destroyInstance();
                    }
                }
                cc.isCallCloseCreator = true;
                return true;
            } else if (vjsb) {
                let globalNetwork = require('globalNetwork');
                globalNetwork.triggerUserLogout();
                const CC_CMD = {
                    CMD_HOME: 1,
                    CMD_TEST: 2
                };
                cc.log('on home -- ' + vjsb.js2cMessage);
                vjsb.js2cMessage(JSON.stringify({
                    cmd: CC_CMD.CMD_HOME,
                    data: {}
                }));
                return true;
            }
        }
        return false;
    };

    const handleCloseGameIframe = () => {
        const loadConfigAsync = require('loadConfigAsync');
        const {LOBBY_SCENE_NAME, LOGIN_IFRAME, IS_PRODUCTION} = loadConfigAsync.getConfig();

        const isBackLobbyClient = handleBackLobbyNativeClient();
        if (isBackLobbyClient) return;

        if  (!LOGIN_IFRAME) {
            if (!IS_PRODUCTION) {
                setDeviceOrientation(false);
            }
            cc.director.preloadScene(LOBBY_SCENE_NAME, () => {
                cc.director.loadScene(LOBBY_SCENE_NAME);
            });
            return;
        }

        const returnUrl = getUrlParam('ru');
        if (returnUrl && LOGIN_IFRAME) {
            if (returnUrl.trim() === 'close') {
                window.close();
            } else {
                window.location.href = returnUrl;
            }
        } else {
            location.reload();
            // window.close();
        }
    };

    const handleFlowOutGame = () => {
        const loadConfigAsync = require('loadConfigAsync');
        const {LOBBY_SCENE_NAME, LOGIN_IFRAME, IS_PRODUCTION} = loadConfigAsync.getConfig();

        const isBackLobbyClient = handleBackLobbyNativeClient();
        if (isBackLobbyClient) return;

        if (LOGIN_IFRAME) {
            if (window && window.location) {
                window.location.reload();
            }
        } else {
            if (!IS_PRODUCTION) {
                setDeviceOrientation(false);
            }
            cc.director.preloadScene(LOBBY_SCENE_NAME, () => {
                cc.director.loadScene(LOBBY_SCENE_NAME);
            });
        }
    };
    const handleBackLogin = () => {
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGIN_IFRAME, LOBBY_SCENE_NAME, IS_PRODUCTION, LOGIN_SCENE_NAME} = loadConfigAsync.getConfig();
        
        const isBackLobbyClient = handleBackLobbyNativeClient();
        if (isBackLobbyClient) return;
        
        if (LOGIN_IFRAME) {
            if (window && window.location) {
                window.location.reload();
            }
        } else {
            if (IS_PRODUCTION) {
                cc.director.preloadScene(LOBBY_SCENE_NAME, () => {
                    cc.director.loadScene(LOBBY_SCENE_NAME);
                });
            } else {
                const nodePersist = cc.director.getScene().getChildByName('OverlayPersistent');
                if (nodePersist) {
                    cc.game.removePersistRootNode(nodePersist);
                }
                setDeviceOrientation(false);
                cc.director.preloadScene(LOGIN_SCENE_NAME, () => {
                    cc.director.loadScene(LOGIN_SCENE_NAME);
                });
            }
        }
    };
    const getMessageSlot = (mess = {}) => {
        return i18n.getMessageSlot(mess) || {};
    };
    const getBetValueWithGame = (gameId, listBet = []) => {
        if (!gameId) return '';

        let betValue = cc.sys.localStorage.getItem('betValueWithGame');
        if (lodash.isEmpty(betValue)) {
            const newObj = {};
            newObj[gameId] = '';
            cc.sys.localStorage.setItem('betValueWithGame', JSON.stringify(newObj));
        } else {
            betValue = JSON.parse(betValue);
            if (lodash.isEmpty(listBet)) {
                return betValue[gameId];
            } else {
                if (lodash.isArray(listBet) && listBet.includes(betValue[gameId])) {
                    return betValue[gameId];
                } else {
                    let isExist = false;
                    Object.keys(listBet).map((betId) => {
                        if (listBet[betId] === betValue[gameId]) {
                            isExist = true;
                        }
                    });
                    if (isExist) {
                        return betValue[gameId];
                    }
                }
            }
        }
        return '';
    };

    const setBetValueWithGame = (gameId, betId)  => {
        let betValue = cc.sys.localStorage.getItem('betValueWithGame');
        if (lodash.isEmpty(betValue)) {
            const newObj = {};
            newObj[gameId] = betId;
            cc.sys.localStorage.setItem('betValueWithGame', JSON.stringify(newObj));
        } else {
            betValue = JSON.parse(betValue);
            betValue[gameId] = betId;
            cc.sys.localStorage.setItem('betValueWithGame', JSON.stringify(betValue));
        }
    };

    const getKeyWithGame = (gameId, key, value = '') => {
        if (!gameId || !key) return '';

        let betLinesValue = cc.sys.localStorage.getItem(key);
        if (lodash.isEmpty(betLinesValue)) {
            const newObj = {};
            newObj[gameId] = value;
            cc.sys.localStorage.setItem(key, JSON.stringify(newObj));
        } else {
            betLinesValue = JSON.parse(betLinesValue);
            return betLinesValue[gameId] ? betLinesValue[gameId] : value;
        }
        return value;
    };

    const setKeyWithGame = (gameId, key, value = '')  => {
        if (!gameId || !key) return '';

        let betLinesValue = cc.sys.localStorage.getItem(key);
        if (lodash.isEmpty(betLinesValue)) {
            const newObj = {};
            newObj[gameId] = value;
            cc.sys.localStorage.setItem(key, JSON.stringify(newObj));
        } else {
            betLinesValue = JSON.parse(betLinesValue);
            betLinesValue[gameId] = value;
            cc.sys.localStorage.setItem(key, JSON.stringify(betLinesValue));
        }
    };

    const optimizeScrollView = (listView) => {
        let view = listView.parent;
        let viewRect = cc.rect(- view.width / 2, - listView.y - view.height, view.width, view.height);
        for (let i = 0; i < listView.children.length; i++) {
            const node = listView.children[i];
            if (viewRect.intersects(node.getBoundingBox())) {
                node.opacity = 255;
            }
            else {
                node.opacity = 0;
            }
        }
    };

    return {
        checkConditionCloseGameIframe,
        handleCloseGameIframe,
        setBetValueWithGame,
        getBetValueWithGame,
        handleBackLogin,
        handleFlowOutGame,
        getMessageSlot,
        getUrlParam,
        optimizeScrollView,
        getKeyWithGame,
        setKeyWithGame,
        addUrlParam
    };
}

module.exports = new gameCommonUtils();
