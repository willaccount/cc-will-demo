

const globalNetwork = require('globalNetwork');
let { userText, pwText} = require('mock');
const serviceRest = require('serviceRest');
const gameNetwork = window.GameNetwork || require('game-network');
const {uuid} = gameNetwork.lib;
let vjsb = window['vjsb'];
let tokenClient = '';

class CC_CMD {
    static CMD_HOME = 1;
    static CMD_TEST = 2;
    static CMD_AUTH = 3;
    static CMD_GET_SOUND_ENABLE = 4;
    static CMD_SET_SOUND_ENABLE = 5;
    static CMD_GET_MUSIC_ENABLE = 6;
    static CMD_SET_MUSIC_ENABLE = 7;
    onSend() {
        vjsb && vjsb.js2cMessage(JSON.stringify({
            cmd: CC_CMD.CMD_TEST,
            msg: this.msgTf.string
        }));
    }
    
    sendGetToken() {
        vjsb && vjsb.js2cMessage(JSON.stringify({
            cmd: CC_CMD.CMD_AUTH
        }));
    }
    
    sendGetSoundEnable() {
        vjsb && vjsb.js2cMessage(JSON.stringify({
            cmd: CC_CMD.CMD_GET_SOUND_ENABLE
        }));
    }
    
    sendSetSoundEnable() {
        vjsb && vjsb.js2cMessage(JSON.stringify({
            cmd: CC_CMD.CMD_SET_SOUND_ENABLE,
            enable: true
        }));
    }
}


if (vjsb) vjsb.c2jsMessage = (msg) => {
    cc.log('c2jsMessage: ' + msg);
    let jso = JSON.parse(msg);
    switch (jso.cmd) {
        case CC_CMD.CMD_AUTH:
            cc.log('token: ' + jso.token);
            tokenClient = jso.token;
            cc.sys.localStorage.setItem('user_token', tokenClient);
            break;
        case CC_CMD.CMD_GET_SOUND_ENABLE:
            cc.log('enable: ' + jso.enable);
            break;
        case CC_CMD.CMD_GET_MUSIC_ENABLE:
            cc.log('enable: ' + jso.enable);
            break;
    }
}
const bridgeAppClient = new CC_CMD();
bridgeAppClient.sendGetToken();


cc.Class({
    getToken() {
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGIN_IFRAME, URL_TOKEN, USER_TOKEN, TOKEN} = loadConfigAsync.getConfig();
        let token = '';
        // if (vjsb && tokenClient) {
        //     token = tokenClient;
        // }
        // else 
        if (TOKEN) {
            token = TOKEN;
        }
        else if (LOGIN_IFRAME) {
            const {getUrlParam, addUrlParam} = require('gameCommonUtils');
            const TRIAL_PARAM = 'trialMode';
            
            let trialMode = false;
            token = getUrlParam(URL_TOKEN);
            trialMode = (getUrlParam(TRIAL_PARAM) === 'true');
            if (!token && trialMode) {
                token = `tr-${uuid()}`;
                addUrlParam("token", token);
            }
            cc.sys.localStorage.setItem(USER_TOKEN, token);
        } else if (typeof window !== 'undefined' && 
                    typeof window["__Game_Bridge"] !== 'undefined' && 
                    typeof window["__Game_Bridge"].getUSS === 'function') {
            token = window["__Game_Bridge"].getUSS();
        } else {
            token = cc.sys.localStorage.getItem(USER_TOKEN);
        }
        // token = "878710cd8de84ec8aed6207ff9bbfe77";
        // token= 'dunousd';
        // token= 'dunovnd';
        token= 'Will1234';
        return token;
    },
    getRefreshToken() {
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGIN_IFRAME, URL_REFRESH_TOKEN = 'refresh-token', USER_REFRESH_TOKEN = 'user-refresh-token'} = loadConfigAsync.getConfig();
        let refreshToken = '';
        if (LOGIN_IFRAME) {
            const {getUrlParam} = require('gameCommonUtils');
            refreshToken = getUrlParam(URL_REFRESH_TOKEN);
            cc.sys.localStorage.setItem(USER_REFRESH_TOKEN, refreshToken);
        } else {
            refreshToken = cc.sys.localStorage.getItem(USER_REFRESH_TOKEN);
        }
        return refreshToken;
    },
    loginScene({callback, gameId, userIndex, callbackAuthFailed}) {
        // cc.log("Login using V3");
        const loadConfigAsync = require('loadConfigAsync');
        const {IS_FINISHED_REMOTE, DEV_ENV, USER_TOKEN} = loadConfigAsync.getConfig();

        cc.log("Login using V3", cc.sys.localStorage.getItem(USER_TOKEN));
        cc.log("Login using V3", vjsb);
        cc.log("Login using V3", tokenClient);

        // if (vjsb && !cc.sys.localStorage.getItem(USER_TOKEN)) {
        //     setTimeout(() => {
        //         this.loginScene({callback, gameId, userIndex, callbackAuthFailed});
        //     }, 100);
        //     return;
        // } else 
        if (!IS_FINISHED_REMOTE) {
            setTimeout(() => {
                this.loginScene({callback, gameId, userIndex, callbackAuthFailed});
            }, 100);
            return;
        }
        this.gameId = gameId;
        const token = this.getToken();
        const {LOGIN_IFRAME} = loadConfigAsync.getConfig();
        const envId = LOGIN_IFRAME ? 'iframe' : 'portal';
        const gameIdSocket = LOGIN_IFRAME ? gameId : 'all';
        // token = '2f8b65390e1d19c38e86394bb6b928c2';
        if (token || !DEV_ENV) {
            if (token) {
                globalNetwork.init(token, envId, gameIdSocket);
                callback();
            }  else {
                callbackAuthFailed();
            }
        } else {
            let dataPost = {
                userName: userText,
                password: pwText,
                fingerPrint: 'test'
            };
            if (cc.USER_INDEX) {
                dataPost = {
                    userName: 'user' + cc.USER_INDEX,
                    password: 'pwduser' + cc.USER_INDEX,
                    fingerPrint: 'test'
                };
            }
            serviceRest.post({url: 'auth/login', data: dataPost, callback: ({data}) => {
                cc.sys.localStorage.setItem(USER_TOKEN, data.data.token);
                globalNetwork.init(data.data.token, '', envId, gameIdSocket);
                callback();
            }, callbackErr: ()=>{
                callbackAuthFailed && callbackAuthFailed();
            }});
        }
    },
});