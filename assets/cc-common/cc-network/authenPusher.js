

function connectingPusher() {
    const globalNetwork = require('globalNetwork');
    const settingPusher = ({token}, loginSuccess = () => {}) => {
        const loadConfigAsync = require('loadConfigAsync');
        const {USER_TOKEN} = loadConfigAsync.getConfig();
        cc.sys.localStorage.setItem(USER_TOKEN, token);
        loginSuccess();
    };
    const leavePusher = () => {
        const loadConfigAsync = require('loadConfigAsync');
        const {USER_TOKEN} = loadConfigAsync.getConfig();
        cc.sys.localStorage.setItem(USER_TOKEN, "");
        globalNetwork.triggerUserLogout();
    };
    return {
        settingPusher,
        leavePusher
    };
}

module.exports = new connectingPusher();
