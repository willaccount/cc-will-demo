const globalNetwork = require('globalNetwork');


cc.Class({
    extends: require("BaseHistory"),

    properties: {
        noBetHistoryText: cc.Node,
        betHistoryNode: cc.Node,
        betDetailNode: cc.Node,
        closeButton: cc.Node,
        pageIndex: cc.Node,
    },

    onLoad() {
        this._super();
        this.extendOnload();
        this.node.on("CLOSE_NOTICE", this.closeNotice, this);
        this.node.on("OPEN_BET_DETAIL", this.openBetDetail, this);
        this.betDetailNode.on("SHOW_BET_HISTORY", ()=>{
            this.showBetHistory();
        });
    },

    start() {
        this.localizeText();
    },

    localizeText() {
        if (this.node.config.MESSAGE_DIALOG) {
            if (this.node.config.MESSAGE_DIALOG.NO_BET_HISTORY) {
                this.noBetHistoryText.getComponentInChildren(cc.Label).string = this.node.config.MESSAGE_DIALOG.NO_BET_HISTORY;
            }
            if (this.node.config.MESSAGE_DIALOG.ERROR_CONNECTION_HISTORY) {
                this.errorMessage.getComponentInChildren(cc.Label).string = this.node.config.MESSAGE_DIALOG.ERROR_CONNECTION_HISTORY;
            }
            if (this.pageIndex && this.node.config.MESSAGE_DIALOG.HISTORY_PAGE) {
                this.pageIndex.getComponentInChildren(cc.Label).string = this.node.config.MESSAGE_DIALOG.HISTORY_PAGE;
            }
        }
    },

    extendOnload() {
        this.init(this.node.config.GAME_ID);
    },

    initBase()
    {
        this._super();
        this.currentPage = 1;
    },

    init(gameId, url = "history/getHistoryUserSpins") {
        this.gameId = gameId;
        this.url = url;
    },

    openPanel() {
        this.showBetHistory();
        this._super();
        if(this.pageIndex) this.pageIndex.active = false;
    },

    showBetHistory() {
        this.betHistoryNode.active = true;
        this.betHistoryNode.opacity = 255;
        this.betDetailNode.active = false;
    },

    requestDataPage(page, quantity, callback, callbackErr) {
        let from = (page - 1) * quantity;
        let token = globalNetwork.getToken();
        let headers = {
            Authorization: token,
        };
        let requestParams = {
            serviceId: this.gameId,
            from: from,
            size: quantity,
        };
        if (this.errorMessage) this.errorMessage.active = false;
        this.requestHistory(requestParams, callback, callbackErr, headers);
    },

    onRequestResponse(res) {
        this.stopLoading();
        this.table.emit('CLEAR_DATA');
        if (res.error && res.error.msg) {
            this.serverMessage.active = true;
            this.serverMessage.getComponentInChildren(cc.Label).string = res.error.msg;
            this.isError= true;
            this.nextBtn.getComponent(cc.Button).interactable = false;
            this.backBtn.getComponent(cc.Button).interactable = false;
        }
        else if (!res.error && Object.keys(res).length > 0 && res.data && res.data.resultList.length > 0) {
            if (res.data && res.data.total) this.totalPage = Math.ceil(res.data.total / this.itemPerPage);

            this.isError= false;
            if(this.pageIndex) this.pageIndex.active = true;
            this.nextBtn.getComponent(cc.Button).interactable = true;
            this.backBtn.getComponent(cc.Button).interactable = true;
            this.updatePageIndexView(this.currentPage);
            if (this.table) this.table.opacity = 255;
            this.table.emit('UPDATE_DATA', res.data.resultList);
            if (this.currentPage == 1) {
                this.backBtn.getComponent(cc.Button).interactable = false;
            }
            if (this.currentPage * this.itemPerPage >= res.data.total) {
                this.nextBtn.getComponent(cc.Button).interactable = false;
                return;
            }
        }
        else if (res.error || !res.data || res.data.resultList.length <= 0) {
            this.noBetHistoryText.active = true;
            if(this.pageIndex) this.pageIndex.active = false;
        } else {
            this.noBetHistoryText.active = false;
            if(this.pageIndex) this.pageIndex.active = true;
        }
    },

    playLoading() {
        this._super();
        this.serverMessage.active = false;
        this.noBetHistoryText.active = false;
    },

    openBetDetail(ev) {
        if (this.loading.active) return;
        ev.stopPropagation();
        let data = ev.getUserData();
        this.showBetDetail(data);
    },

    showBetDetail(data) {
        this.betHistoryNode.active = false;
        this.betDetailNode.active = true;
        this.betDetailNode.emit("OPEN_BET_DETAIL", data);
    },

    setToken(token, type = 'user', userId) {
        this.token = token;
        this.tokenType = type;
        this.userId = userId;
        this.betDetailNode.getComponent('BetDetailHistory').setToken(token, type, userId);
    },

    disableCloseDetail() {
        this.betDetailNode.emit("DISABLE_CLOSE");
    },

    closeNotice(){
        if (this.errorMessage) this.errorMessage.active = false;
        this.betDetailNode.emit("CLOSE_NOTICE");
    },
    requestErr() {
        this._super();
        this.noBetHistoryText.active = false;
    },
});
