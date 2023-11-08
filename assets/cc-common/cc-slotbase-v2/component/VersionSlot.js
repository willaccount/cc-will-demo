

cc.Class({
    extends: cc.Component,

    properties: {
        versionFile:  {
            type: cc.Asset,
            default: null
        },
        versionText: cc.Label
    },

    onLoad() {
        const loadConfigAsync = require('loadConfigAsync');
        const {IS_PRODUCTION} = loadConfigAsync.getConfig();
        if (IS_PRODUCTION) {
            this.node.active = false;
        }
    },

    start () {
        cc.log(this.versionFile);
        this.versionText.string = this.versionFile.json.version;
    },
});
