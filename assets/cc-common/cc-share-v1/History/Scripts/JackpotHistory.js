cc.Class({
    extends: require("BaseHistory"),

    properties: {
        noJackpotText: cc.Node,
        isMiniGame: false,
        initialized: false,
        jpList: "GRAND-MAJOR",
        pageIndex: cc.Node,
    },

    onLoad()
    {
        this.initBase();
    },
    start(){
        // this.localizeText();
    },
    localizeText() {
        if (this.node.config.MESSAGE_DIALOG) {
            if (this.node.config.MESSAGE_DIALOG.NO_JACKPOT_HISTORY) {
                this.noJackpotText.getComponentInChildren(cc.Label).string = this.node.config.MESSAGE_DIALOG.NO_JACKPOT_HISTORY;
            }
            if (this.node.config.MESSAGE_DIALOG.ERROR_CONNECTION_HISTORY) {
                this.errorMessage.getComponentInChildren(cc.Label).string = this.node.config.MESSAGE_DIALOG.ERROR_CONNECTION_HISTORY;
            }
            if (this.pageIndex && this.node.config.MESSAGE_DIALOG.HISTORY_PAGE) {
                this.pageIndex.getComponentInChildren(cc.Label).string = this.node.config.MESSAGE_DIALOG.HISTORY_PAGE;
            }
        }
    },
    openPanel() {
        this.table.emit('CLEAR_DATA');
        if (this.serverMessage) this.serverMessage.active = false;
        this._super();
        if(this.pageIndex) this.pageIndex.active = false;
    },
    initBase()
    {
        if(this.initialized)
            return;
        this._super();
        this.url = "jackpothistory/slot";
        this.noJackpotText.active = false;
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGIN_IFRAME} = loadConfigAsync.getConfig();

        if (this.node.config)
        {
            let betIds = this.node.config.BET_IDS;
            if (LOGIN_IFRAME)
            {
                betIds = this.node.config.BET_IDS_IFRAME;
            }
            if (this.node.config.JP_LIST_HISTORY)
                this.jpList = this.node.config.JP_LIST_HISTORY;
            this.init(this.node.config.GAME_ID, null, betIds, this.jpList);
        }
        //
        this.initialized = true;
    },

    //slot v1
    init(gameId, soundPlayer, betIds, jpList = "GRAND-MAJOR", jpPrefix = "kts_", url = "jackpothistory/slot")
    {
        this.gameId = gameId;
        this.jpList = jpList;
        this.betIds = betIds;
        this.jpPrefix = jpPrefix;
        if (this.isMiniGame) {
            this.jpPrefix = 'ktmn_';
        }
        this.url = url;

        if (!this.node.soundPlayer && soundPlayer != null)
            this.node.soundPlayer = soundPlayer;

        if (soundPlayer)
            this.playSoundClick = soundPlayer.playClickButton.bind(soundPlayer);
    },

    // fish-client
    initObj () { 
        //this.node.emit(DTConstantsVariable.PANEL_EVENT.Show);
        this.openPanel();
    },

    clickFromMain() {
        if (cc.sys.os != cc.sys.OS_IOS || !cc.sys.isBrowser) {
            this.node.emit("SHOW_PANEL");
            this.openPanel();
        }
    },
    
    playLoading(){
        this._super();
        this.serverMessage.active = false;
        this.noJackpotText.active = false;
    },

    onRequestResponse(res)
    {
        this._super(res);
        if (res.error && res.error.msg) {
            this.table.emit('CLEAR_DATA');
            this.serverMessage.active = true;
            this.serverMessage.getComponentInChildren(cc.Label).string = res.error.msg;
            if(this.pageIndex) this.pageIndex.active = false;
        }
        else if (res.error || Object.keys(res).length <= 0 || !res.data || res.data.length <= 0)
        {
            this.noJackpotText.active = true; 
            if (this.pageIndex)this.pageIndex.active = false;
        }
        else
        {
            this.noJackpotText.active = false;
            if (this.pageIndex)this.pageIndex.active = true;
        }
    }
});
