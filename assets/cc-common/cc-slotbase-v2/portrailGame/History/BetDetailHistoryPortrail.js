const globalNetwork = require('globalNetwork');
const serviceRest = require('serviceRest');
const BetHistoryDetailPage = require("BetHistoryDetailPage");

const CANVAS_WIDTH = 720;
const TITLE = {
    NORMAL: "Quay Thường",
    FREE: "Quay Miễn Phí",
};

function addZero(i) {
    if (i < 10) {
        i = '0' + i;
    }
    return i;
}

cc.Class({
    extends: cc.Component,

    properties: {
        title: cc.Label,
        time: cc.Label,

        backBtn: cc.Node,
        nextBtn: cc.Node,
        loading: cc.Node,
        errorMessage: cc.Node,
        noBetDetail: cc.Node,
        closeButton: cc.Node,

        detailPages: [BetHistoryDetailPage],
        durationTransition: 0.3,

        //error message
        serverMessage: cc.Node,
    },

    onEnable() {
        if (this.serverMessage) this.serverMessage.active = false;
    },

    onLoad() {
        this.node.on("OPEN_BET_DETAIL", this.openBetDetail, this);
        this.node.on("DISABLE_CLOSE", this.disableClose.bind(this));
        this.node.on("CLOSE_NOTICE", this.closeNotice, this);

        this.node.setToken = this.setToken.bind(this);

        this.node.active = false;
        this.assignVariable();
    },

    assignVariable() {
        this.lastDetailPage = null;
        this.currentDetailPage = null;
        this.currentPage = -1;
        this.lastPage = -1;
        this.itemPerPage = 5;
        this.totalPages = 0;
        this.timeFormat = "DD/MM hh:mm:ss";
        this.indexUsedPage = 0;

        //save data bet history from server
        this.listResultData = new Map();
    },

    setToken(token, type, userId) {
        this.token = token;
        this.tokenType = type;
        this.userId = userId;
    },

    openLastBetDetail() {
        if (this.currentPage == 0) {
            this.openBetDetail(this.sessionData, null);
        } else {
            this.closeNotice();
            this.node.opacity = 255;
            if (this.totalPages == 1) {
                this.nextBtn.active = false;
                this.backBtn.active = false;
            } else if (this.currentPage == this.totalPages - 1) {
                this.nextBtn.getComponent(cc.Button).interactable = false;
                this.nextBtn.active = false;
                this.backBtn.active = true;
                this.backBtn.getComponent(cc.Button).interactable = true;
            } else if (this.currentPage == 0) {
                this.backBtn.getComponent(cc.Button).interactable = false;
                this.backBtn.active = false;
                this.nextBtn.active = true;
                this.nextBtn.getComponent(cc.Button).interactable = true;
            } else {
                this.backBtn.active = true;
                this.nextBtn.active = true;
                this.nextBtn.getComponent(cc.Button).interactable = true;
                this.backBtn.getComponent(cc.Button).interactable = true;
            } 
        }
    },

    //#region summary bet history
    openBetDetail(sessionData, callback = null) {
        this.nextBtn.getComponent(cc.Button).interactable = false;
        this.backBtn.getComponent(cc.Button).interactable = false;

        this.sessionData = sessionData;

        this.node.opacity = 255;
        if(this._closeTween){
            this._closeTween.stop();
            this._closeTween = null;
        }
        this.resetBoard();
        this.resetDetailPages();
        this.requestTotalPage();
        this.renderFirstDetailPage(callback);
    },

    resetBoard() {
        this.currentPage = -1;
        this.lastPage = -1;
        this.totalPages = 0;
        this.indexUsedPage = 0;
        this.listResultData = new Map();
    },

    requestTotalPage() {
        let token = this.token || globalNetwork.getToken();
        let headers = {
            Authorization: token
        };

        headers['token-type'] = 'user';
        if (this.tokenType) headers['token-type'] = this.tokenType;
        if (this.userId) headers['user-id'] = this.userId;

        let requestParams = {
            serviceId: this.node.config.GAME_ID,
            psId: this.sessionData.sessionId,
        };
        serviceRest.getWithHeader({
            url: "history/getHistoryUserSpinSummary",
            params: requestParams,
            callback: this.onTotalDetailResponse.bind(this),
            callbackErr: this.requestErr.bind(this),
            headers
        });
        this.currentPage = -1;
        this.sessionId = this.sessionData.sessionId;
    },

    onTotalDetailResponse(res) {
        if (res.error && res.error.msg) {
            if (this.table) this.table.clearTable();
            if (this.loading) this.loading.active = false;
            this.serverMessage.active = true;
            this.serverMessage.getComponentInChildren(cc.Label).string = res.error.msg;
        }
        else if (res.data && res.data.resultList && res.data.resultList.length > 0) {
            this.sessionData.summaryData = res.data.resultList[0];
            this.sessionData.scroll = res.data.scroll;
            this.sessionData.summaryData.sessionId = this.sessionData.sessionId;
            this.renderTotalPage();
        }
        else {
            if (this.sessionData) {
                throw new Error('Null summary data: ' + this.sessionData.sessionId);
            }
            this.requestErr();
        }
    },

    renderTotalPage() {
        // no totalPage

    },
    //#endregion

    //#region page detail
    renderFirstDetailPage(callback = null) {
        // call page detail index
        this.currentPage = 0;
        this.nextBtn.active = false;
        this.backBtn.active = false;

        this.requestDetail(this.sessionId, this.currentPage);

        // tween detail page to overlay bethistory
        this.node.opacity = 255;
        cc.tween(this.node)
            .to(this.durationTransition, { position: cc.v2(0, 0)})
            .call(() => {
                callback && callback();
            })
            .start();
    },

    onNextDetailPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            this.requestDetail(this.sessionId, this.currentPage);
        }
        this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
    },

    onPreviousDetailPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.requestDetail(this.sessionId, this.currentPage);
        }
        this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
    },

    requestDetail(sessionId, page, url = "history/getHistoryUserSpinDetails") {
        this.playLoading();
        this.nextBtn.getComponent(cc.Button).interactable = false;
        this.backBtn.getComponent(cc.Button).interactable = false;

        if (this.listResultData && this.listResultData.has(page)) {
            if (this.loading) this.loading.active = false;
            this.renderDetailPage();
            return;
        }

        this.sessionId = sessionId;

        let from = page;
        let token = this.token || globalNetwork.getToken();
        let headers = { Authorization: token };

        headers['token-type'] = 'user';
        if (this.tokenType) headers['token-type'] = this.tokenType;
        if (this.userId) headers['user-id'] = this.userId;

        let requestParams = {
            serviceId: this.node.config.GAME_ID,
            from: from,
            size: this.itemPerPage,
            psId: sessionId,
            scroll: true
        };

        serviceRest.getWithHeader({
            url: url,
            params: requestParams,
            callback: this.onRequestDetailResponse.bind(this),
            callbackErr: this.requestErr.bind(this),
            headers
        });
    },

    onRequestDetailResponse(res) {
        if (this.loading) this.loading.active = false;

        if (res.error && res.error.msg) {
            this.serverMessage.active = true;
            this.serverMessage.getComponentInChildren(cc.Label).string = res.error.msg;
            return;
        }
        else if (res.error || !res.data || res.data.resultList.length <= 0) {
            this.noBetDetail.active = true;
            return;
        } else {
            this.noBetDetail.active = false;
        }

        this.totalPages = res.data.total;
        this.currentPage = res.data.from;

        let indexPage = res.data.from;
        for (let i = 0; i < res.data.resultList.length; i++) {
            if (!this.listResultData.has(indexPage)) {
                this.listResultData.set(indexPage, res.data.resultList[i]);
            }
            indexPage++;
        }
        
        this.renderDetailPage();
    },
    //#endregion

    //#region common
    resetDetailPages() {
        for (let i = 0; i < this.detailPages.length; i++) {
            this.detailPages[i].node.position = new cc.Vec2(i * CANVAS_WIDTH, 0);
            this.detailPages[i].hideInfoDetailPage();
        }
        this.currentDetailPage = null;

        this.lastPage = this.currentPage = -1;
    },

    requestErr() {
        cc.log("err");
        if (this.loading) this.loading.active = false;
        if (this.errorMessage) this.errorMessage.active = true;
    },

    renderDetailPage() {
        if (!this.listResultData) return;

        let data = this.listResultData.get(this.currentPage);
        if (!data) {
            //no date in listResultData
            console.warn("check logic renderDetailPage");
            return;
        }

        let { mode, timestamp } = data;
        if (mode) this.title.string = mode == "normal" ? TITLE.NORMAL : TITLE.FREE;
        if (timestamp) this.time.string = this.formatTimeStamp(timestamp);

        // create extend data
        let lastedWonSymbol, lastedNumberWinFeatures;
        let previousSpinData = this.listResultData.get(this.currentPage - 1);
        if (previousSpinData) {
            lastedWonSymbol = previousSpinData.result.totalWinSymbol;
            lastedNumberWinFeatures = previousSpinData.result.numberWinFeatures;
        }

        let extendData = {
            lastedNumberWinFeatures: lastedNumberWinFeatures,
            lastedWonSymbol: lastedWonSymbol,
            currentPage: this.currentPage,
            totalPages: this.totalPages
        };

        if (!this.currentDetailPage) {
            this.indexUsedPage = 0;
            
            this.currentDetailPage = this.detailPages[0];
            this.currentDetailPage.hideInfoDetailPage();
            this.currentDetailPage.updateData(data, this.sessionData.summaryData, extendData);
            this.currentDetailPage.node.opacity = 255;
            this.lastPage = this.currentPage;
            this.lastDetailPage = this.currentDetailPage;
        } else {
            this.lastDetailPage = this.currentDetailPage;

            this.indexUsedPage = (this.indexUsedPage + 1) % this.detailPages.length;
            this.currentDetailPage = this.detailPages[this.indexUsedPage];
            this.currentDetailPage.hideInfoDetailPage();
            this.currentDetailPage.updateData(data, this.sessionData.summaryData, extendData);

            // do transition display
            if (this.lastPage > this.currentPage) {
                // left to right
                let tartgetLastDetailPage = new cc.Vec2(CANVAS_WIDTH, 0);
                cc.tween(this.lastDetailPage.node)
                    .to(this.durationTransition, { position: tartgetLastDetailPage })
                    .call(() => {
                        this.lastDetailPage.hideInfoDetailPage();
                        this.lastDetailPage.node.opacity = 0;
                    })
                    .start();

                this.currentDetailPage.node.position = new cc.Vec2(-CANVAS_WIDTH, 0);
                this.currentDetailPage.node.opacity = 255;

                let tartgetCurrentDetailPage = new cc.Vec2(0, 0);
                cc.tween(this.currentDetailPage.node)
                    .to(this.durationTransition, { position: tartgetCurrentDetailPage })
                    .start();

            } else {
                // right to left
                let tartgetLastDetailPage = new cc.Vec2(-CANVAS_WIDTH, 0);
                cc.tween(this.lastDetailPage.node)
                    .to(this.durationTransition, { position: tartgetLastDetailPage })
                    .call(() => {
                        this.lastDetailPage.hideInfoDetailPage();
                        this.lastDetailPage.node.opacity = 0;
                    })
                    .start();

                this.currentDetailPage.node.position = new cc.Vec2(CANVAS_WIDTH, 0);
                this.currentDetailPage.node.opacity = 255;

                let tartgetCurrentDetailPage = new cc.Vec2(0, 0);
                cc.tween(this.currentDetailPage.node)
                    .to(this.durationTransition, { position: tartgetCurrentDetailPage })
                    .start();
            }
            this.lastPage = this.currentPage;
        }

        cc.tween(this.node)
            .delay(this.durationTransition)
            .call(() => {
                if (this.totalPages == 1) {
                    this.nextBtn.active = false;
                    this.backBtn.active = false;
                } else if (this.currentPage == this.totalPages - 1) {
                    this.nextBtn.getComponent(cc.Button).interactable = false;
                    this.nextBtn.active = false;
                    this.backBtn.active = true;
                    this.backBtn.getComponent(cc.Button).interactable = true;
                } else if (this.currentPage == 0) {
                    this.backBtn.getComponent(cc.Button).interactable = false;
                    this.backBtn.active = false;
                    this.nextBtn.active = true;
                    this.nextBtn.getComponent(cc.Button).interactable = true;
                } else {
                    this.backBtn.active = true;
                    this.nextBtn.active = true;
                    this.nextBtn.getComponent(cc.Button).interactable = true;
                    this.backBtn.getComponent(cc.Button).interactable = true;
                } 
            })
            .start();
    },

    disableClose() {
        if (this.closeButton) this.closeButton.active = false;
    },

    closeNotice() {
        if (this.errorMessage) this.errorMessage.active = false;
    },

    playLoading() {
        if (this.errorMessage) this.errorMessage.active = false;
        if (this.noBetDetail) this.noBetDetail.active = false;
        if (this.loading) this.loading.active = true;
        this.serverMessage.active = false;
    },

    formatTimeStamp(ts) {
        const date = new Date(ts);
        let time = '';

        let year = date.getFullYear();
        let month = addZero(date.getMonth() + 1);
        let day = addZero(date.getDate());

        let hours = addZero(date.getHours());
        let minutes = addZero(date.getMinutes());
        let seconds = addZero(date.getSeconds());

        if (this.timeFormat) {
            time = this.timeFormat.replace('YYYY', year)
                .replace('MM', month)
                .replace('DD', day)
                .replace('hh', hours)
                .replace('mm', minutes)
                .replace('ss', seconds);
        } else {
            time = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        }
        return time;
    },

    onClose() {
        this.resetBoard();
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();

        const evt = new cc.Event.EventCustom("ON_BET_DETAIL_CLOSED", true);
        this.node.dispatchEvent(evt);
        if(this._closeTween){
            this._closeTween.stop();
            this._closeTween = null;
        }
        this._closeTween = cc.tween(this.node)
            .to(this.durationTransition, { position: cc.v2(CANVAS_WIDTH, 0) })
            .call(() => {
                this.node.opacity = 0;
                this._closeTween = null;
            });
        this._closeTween.start();
    },
    //#endregion

});
