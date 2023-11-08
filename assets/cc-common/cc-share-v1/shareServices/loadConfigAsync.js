/* global globalDomainSupport,Sentry, CC_DEV */

const serviceRest = require('serviceRest');
const lodash = require('lodash');
const appConfig = require('appConfig');
const XOCypher = require("XOCypher");

const decryptData = (data) => {
    const keyEncrypt = 'Không Biết Đặt Tên Gì';
    if (data.IS_DECODE) {
        Object.keys(data).forEach(key => {
            if (key === 'API_URL' || key === 'SOCKET_URL' || key.indexOf('IPMaster') > -1) {
                if (lodash.isArray(data[key])) {
                    for (let i = 0; i < data[key].length; i++) {
                        data[key][i] = XOCypher.decode(keyEncrypt, data[key][i]);
                    }
                } else {
                    data[key] = XOCypher.decode(keyEncrypt, data[key]);
                }
            }
        });
    }
    delete data.IS_DECODE;
    return data;
};

function loadConfigAsync() {
    this.dataUpdate = lodash.cloneDeep(appConfig);
    const isDebugMode = cc.sys.isBrowser && window.location.hostname === 'localhost';
    

    if (this.dataUpdate.REMOTE_CONFIG_URL_FULL && !cc.sys.isBrowser && !isDebugMode) {
        setTimeout(() => {
            serviceRest.get({
                apiUrl: this.dataUpdate.REMOTE_CONFIG_URL_FULL,
                url: '',
                callback: handleDataSuccess.bind(this),
                callbackErr: handleDataError.bind(this)
            });
        }, 100);
    }
    else if (this.dataUpdate.REMOTE_CONFIG_URL_FULL && cc.sys.isBrowser && !isDebugMode) {
        setTimeout(() => {
            serviceRest.getRawDataWeb({
                fullURL: this.dataUpdate.REMOTE_CONFIG_URL_FULL,
                callback: handleDataSuccess.bind(this),
                callbackErr: handleDataError.bind(this)
            });
        }, 100);
    }
    else if (this.dataUpdate.REMOTE_CONFIG_URL && cc.sys.isBrowser && !isDebugMode) {
        if (window && window.dataConfigM) {
            this.dataUpdate = lodash.cloneDeep(window.dataConfigM);
            this.dataUpdate = decryptData(this.dataUpdate);
            this.dataUpdateProd = lodash.cloneDeep(this.dataUpdate);
            cc.sys.localStorage.setItem('appConfigLocalStore', JSON.stringify(this.dataUpdateProd));
            this.dataUpdate.IS_FINISHED_REMOTE = true;
        } else {
            const timeStampBuild = window.buildTime ? parseInt(window.buildTime) : new Date().getTime();
            setTimeout(() => {
                const domainName = typeof globalDomainSupport !== 'undefined' ? globalDomainSupport : window.location.origin;
                serviceRest.get({
                    apiUrl: domainName + this.dataUpdate.REMOTE_CONFIG_URL,
                    params:{t : timeStampBuild}, 
                    url: '',
                    callback: handleDataSuccess.bind(this),
                    callbackErr: handleDataError.bind(this)
                });
            }, 100);
        }
    } else {
        if (cc.sys.localStorage.getItem("enviroment") != null) {
            try {
                if (cc.sys.localStorage.getItem("enviroment").indexOf("test") >= 0) {
                    const appConfigDebug = require('appConfig-debug');
                    if (appConfigDebug) {
                        this.dataUpdate = lodash.cloneDeep(appConfigDebug);
                        this.dataUpdate = decryptData(this.dataUpdate);
                    } else {
                        this.dataUpdate = lodash.cloneDeep(appConfig);
                        this.dataUpdate = decryptData(this.dataUpdate);
                    }
                } else {
                    this.dataUpdate = lodash.cloneDeep(appConfig);
                    this.dataUpdate = decryptData(this.dataUpdate);
                }
            } catch (e) {
                this.dataUpdate = lodash.cloneDeep(appConfig);
                this.dataUpdate = decryptData(this.dataUpdate);
            }
        } else {
            this.dataUpdate = lodash.cloneDeep(appConfig);
            this.dataUpdate = decryptData(this.dataUpdate);
        }
        this.dataUpdate.IS_FINISHED_REMOTE = true;
    }

    const handleDataSuccess = (data) => {
        this.dataUpdate = lodash.cloneDeep(data);
        this.dataUpdate = decryptData(this.dataUpdate);
        this.dataUpdateProd = lodash.cloneDeep(this.dataUpdate);
        cc.sys.localStorage.setItem('appConfigLocalStore', JSON.stringify(this.dataUpdateProd));
        this.dataUpdate.IS_FINISHED_REMOTE = true;
    };

    const handleDataError = () => {
        let appConfigLocal = cc.sys.localStorage.getItem('appConfigLocalStore');
        if (appConfigLocal) {
            appConfigLocal = JSON.parse(appConfigLocal);
            this.dataUpdate = lodash.cloneDeep(appConfigLocal);
        } else {
            this.dataUpdate = lodash.cloneDeep(appConfig);
        }
        this.dataUpdate = decryptData(this.dataUpdate);
        this.dataUpdateProd = lodash.cloneDeep(this.dataUpdate);
        this.dataUpdate.IS_FINISHED_REMOTE = true;
    };

    const getConfig = () => {
        this.dataUpdate.TOKEN = this.TOKEN;
        return this.dataUpdate;
    };

    const switchEnv = (isProd) => {
        if (isProd) {
            const appConfig = require('appConfig');
            if (this.dataUpdateProd) {
                this.dataUpdate = lodash.cloneDeep(this.dataUpdateProd);
            } else {
                this.dataUpdate = lodash.cloneDeep(appConfig);
            }
            this.dataUpdate = decryptData(this.dataUpdate);
            this.dataUpdate.IS_FINISHED_REMOTE = true;
        } else {
            const appConfigDebug = require('appConfig-debug');
            this.dataUpdate = lodash.cloneDeep(appConfigDebug);
            this.dataUpdate = decryptData(this.dataUpdate);
            this.dataUpdate.IS_FINISHED_REMOTE = true;
        }
    };

    const setUpSentry = () => {
        const {IS_PRODUCTION, IS_SHOW_STATS} = this.dataUpdate;
        if (typeof Sentry !== 'undefined') {
            if (IS_PRODUCTION) {
                Sentry.init({ dsn: 'https://32ab507534bc4befbd5e1b20e223c93d@sentry.io/1780011' });
            } else {
                if (IS_SHOW_STATS) {
                    cc.debug.setDisplayStats(true);
                }
                Sentry.init({ dsn: 'https://b034a1c4d32e42af90071e62d2bf3290@sentry.io/2655786' });
            }
        }
    };

    const setToken = (token) => {
        this.TOKEN = token;
    };

    return {
        setToken,
        setUpSentry,
        switchEnv,
        getConfig
    };
}

module.exports = new loadConfigAsync();
