

cc.Class({
    extends: cc.Component,

    properties: {
        token: {
            default: "",
            visible: false
        },
    },


    init (token) {
        let globalNetwork = require('globalNetwork');
        globalNetwork.init(token);
    },
});
