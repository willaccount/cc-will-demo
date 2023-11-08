const globalNetwork = require('globalNetwork');
const serviceRest = require('serviceRest');
const arrayTypeJackpot = ["MINI", "MINOR", "MAJOR", "GRAND"];
const { formatMoney } = require("utils");

cc.Class({
    extends: cc.Component,

    properties: {
        title: cc.Label,
        table: require("SlotTableHistory"),
        backBtn: cc.Node,
        nextBtn: cc.Node,
        loading: cc.Node,
        scrollItem: cc.Prefab,
        scrollContainer: cc.Node,
        highlight: cc.Node,
        scrollView: cc.ScrollView,
        errorMessage: cc.Node,
        noBetDetail: cc.Node,
        hasFreespinOption: false,
        displayItem: 3,
        labelTotalWin: cc.Label,
        summaryNode: cc.Node,

        titleJP: cc.Node,
        listJP: [cc.SpriteFrame],
        titleWinAmt: cc.Node,
        titleLayout: cc.Node,
        nameBetHistoryScrollItem: "BetHistoryScrollItem",
        closeButton: cc.Node,
        normalName: "Normal",
        freeGameName: "FreeGame",
        topUpName: "Topup",
        bonusName: "Chọn Hũ",
        jackpotName: "Thắng Hũ",
        summaryName: "Tổng Kết",
    },


    onLoad() {
        this.node.on('OPEN_BET_DETAIL', (sessionData) => {
            this.nextBtn.getComponent(cc.Button).interactable = false;
            this.backBtn.getComponent(cc.Button).interactable = false;

            this.resetBoard();
            this.scrollView.scrollTo(cc.v2(0, 0), 0.0);
            this.sessionData = sessionData;

            if (this.summaryNode) this.summaryNode.opacity = 0;
            if (this.table) this.table.node.opacity = 0;
            if (this.loading) this.loading.active = true;
            if (this.title) this.title.string = "";
            if (this.errorMessage) this.errorMessage.active = false;
            if (this.noBetDetail) this.noBetDetail.active = false;
            this.requestTotalPage();
        });
        this.node.on('ON_SCROLL_CLICK', (ev) => {
            ev.stopPropagation();
            let userData = ev.getUserData();
            if (userData.index != this.currentPage) {
                this.currentPage = userData.index;

                if (userData.index >= 0)
                    this.requestDetail(this.sessionId, userData.index);
                else {
                    this.renderTotalPage();
                }
            }
        });

        this.node.on("DISABLE_CLOSE", this.disableClose.bind(this));
        this.node.on("CLOSE_NOTICE", this.closeNotice, this);
        this.node.active = false;
        this.currentPage = -1;
        this.itemPerPage = 1;
        this.curHighLight = -1;

        this.serverMessage = cc.instantiate(this.errorMessage);
        this.serverMessage.setParent(this.errorMessage.parent);
        this.serverMessage.active = false;
        this.showElement();
    },

    start() {
        this.modeItem = new cc.NodePool();
        for (let i = 0; i < 10; i++) {
            this.modeItem.put(cc.instantiate(this.scrollItem));
        }
        this.localizeText();
    },

    localizeText() {
        if (this.node.config.MESSAGE_DIALOG) {
            this.normalName = this.node.config.MESSAGE_DIALOG.NORMAL_GAME;
            this.freeGameName = this.node.config.MESSAGE_DIALOG.FREE_GAME;
            this.topUpName = this.node.config.MESSAGE_DIALOG.TOPUP_GAME;
            this.bonusName = this.node.config.MESSAGE_DIALOG.BONUS_GAME;
            this.jackpotName = this.node.config.MESSAGE_DIALOG.JACKPOT;
            this.summaryName = this.node.config.MESSAGE_DIALOG.SUMMARY;
        }
    },

    getModeItem() {
        let item = this.modeItem.get();
        if (!item) {
            item = cc.instantiate(this.scrollItem);
        }
        return item;
    },

    onEnable() {
        this.serverMessage.active = false;
        this.showElement();
    },

    requestTotalPage() {
        let token = this.token || globalNetwork.getToken();
        let headers = {
            Authorization: token
        };

        headers['token-type'] = 'user';
        if (this.tokenType) {
            headers['token-type'] = this.tokenType;
        }
        if (this.userId) {
            headers['user-id'] = this.userId;
        }
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
        // this.requestDetail(this.sessionData.sessionId, 0);
        if (this.titleJP) this.titleJP.active = false;
        this.resetWinAmt();
    },

    onTotalDetailResponse(res) {
        if (res.error && res.error.msg) {
            if (this.table) this.table.clearTable();
            if (this.loading) this.loading.active = false;
            this.serverMessage.active = true;
            this.noBetDetail.active = false;
            this.hideElement();
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
        if (this.loading) this.loading.active = false;
        if (this.table) {
            this.table.node.opacity = 255;
            this.table.node.active = false;
        }
        if (this.title) this.title.string = "";
        this.updateHighlight(-1);
        this.backBtn.getComponent(cc.Button).interactable = false;
        this.nextBtn.getComponent(cc.Button).interactable = true;

        if (this.summaryNode) {
            this.summaryNode.opacity = 255;
            this.summaryNode.active = true;
            this.summaryNode.emit('DISPLAY_DATA', this.sessionData.summaryData);
        }

        // init scroll bar
        this.loadModeItem({ scroll: this.sessionData.scroll });

        if (this.titleJP) this.titleJP.active = false;
        this.resetWinAmt();
    },

    playLoading() {
        if (this.errorMessage) this.errorMessage.active = false;
        if (this.noBetDetail) this.noBetDetail.active = false;
        this.scrollContainer.stopAllActions();
        if (this.loading) this.loading.active = true;
        this.serverMessage.active = false;
    },

    requestDetail(sessionId, page, url = "history/getHistoryUserSpinDetails") {
        this.playLoading();
        this.nextBtn.getComponent(cc.Button).interactable = false;
        this.backBtn.getComponent(cc.Button).interactable = false;
        let from = (page) * this.itemPerPage;
        this.sessionId = sessionId;
        let token = this.token || globalNetwork.getToken();
        let headers = {
            Authorization: token
        };

        headers['token-type'] = 'user';
        if (this.tokenType) {
            headers['token-type'] = this.tokenType;
        }
        if (this.userId) {
            headers['user-id'] = this.userId;
        }

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
            callback: this.onRequestResponse.bind(this),
            callbackErr: this.requestErr.bind(this),
            headers
        });
    },

    onRequestResponse(res) {
        if (this.loading) this.loading.active = false;
        this.resetWinAmt();
        if (res.error && res.error.msg) {
            if (this.table) this.table.clearTable();
            this.serverMessage.active = true;
            this.noBetDetail.active = false;
            this.hideElement();
            this.serverMessage.getComponentInChildren(cc.Label).string = res.error.msg;
            return;
        }
        else if (res.error || !res.data || res.data.resultList.length <= 0) {
            if (!this.errorMessage.active) this.noBetDetail.active = true;
            return;
        } else {
            this.noBetDetail.active = false;
        }

        if (this.currentPage == -1) {
            this.loadModeItem(res.data);
            return;
        }

        this.nextBtn.getComponent(cc.Button).interactable = true;
        this.backBtn.getComponent(cc.Button).interactable = true;

        if (res.data.total <= this.currentPage * this.itemPerPage + 1) {
            this.nextBtn.getComponent(cc.Button).interactable = false;
        }

        this.updateHighlight(this.currentPage);
        this.updateScroller();
        if (this.summaryNode) this.summaryNode.active = false;
        if (this.table) {
            this.table.node.active = true;
            this.table.renderResult(res.data.resultList[0]);
        }
        this.updateTitle(res.data.resultList[0]);
        this.updateTitleJP(res.data.resultList[0]);

        let { latestWinJackpotInfo } = res.data.resultList[0];
        let jackpotAmount = latestWinJackpotInfo && latestWinJackpotInfo.jackpotAmount ? latestWinJackpotInfo.jackpotAmount : 0;

        let mode = res.data.resultList[0].mode;
        let winAmount = res.data.resultList[0].winAmount;
        if (mode === 'free' || mode === 'topup') winAmount = res.data.resultList[0].winAmount + jackpotAmount;
        if (winAmount && winAmount > 0 && mode !== 'normal') {
            this.updateWinAmt(`: ${formatMoney(winAmount)}`);
        }
    },

    loadModeItem(data) {
        let { scroll } = data;
        let lastMode = '';
        this.timeCount = [];
        this.scrollList = [];


        this.cleanScrollList();
        this.addButtonTotalPage();

        let countFreeSpin = 0;


        for (let i = 0; i < scroll.length; i++) {

            let parsedData = scroll[i].split(':');
            let indexPage = parseInt(parsedData[0]);
            let mode = parsedData[1];
            this.scrollList.push(mode);
            let count = (lastMode != mode) ? 1 : this.timeCount[i - 1] + 1;
            this.timeCount[i] = count;
            lastMode = mode;

            switch (mode) {
                case "normal":
                    mode = this.normalName || "normal";
                    break;
                case "free":
                    if (this.hasFreespinOption) {
                        countFreeSpin++;
                        mode = (this.freeGameName || "Free") + " " + countFreeSpin;
                    } else {
                        countFreeSpin++;
                        if (parsedData[2] == 1)
                            mode = (this.freeGameName || "Free") + " " + countFreeSpin;
                        else
                            mode = (this.topUpName || "Topup") + " " + countFreeSpin;
                    }
                    break;
                case "bonus":
                    mode = (this.bonusName || "Bonus") + " " + this.timeCount[i];
                    break;
            }

            if (mode == "free_option") {
                countFreeSpin = 0;
            } else {
                let labelScroll = null;
                let item = this.getModeItem();
                item.parent = this.scrollContainer;
                if (item.getComponent(cc.Label)) {
                    labelScroll = item.getComponent(cc.Label);
                } else {
                    labelScroll = item.getComponentInChildren(cc.Label);
                }
                if (labelScroll) labelScroll.string = mode;
                item.getComponent(this.nameBetHistoryScrollItem).setIndex(indexPage);
            }
        }

        this.updateHighlight(-1);
    },

    updateHighlight(pos) {
        for (let i = 0; i < this.scrollContainer.children.length; i++) {
            let item = this.scrollContainer.children[i];
            let labelScroll = null;
            let scrollItem = item.getComponent(this.nameBetHistoryScrollItem);
            if (item.getComponent(cc.Label)) {
                labelScroll = item.getComponent(cc.Label);
            } else {
                labelScroll = item.getComponentInChildren(cc.Label);
            }
            if (scrollItem && scrollItem.index == pos) {
                this.highlight.parent = item;
                this.highlight.position = cc.v2(0, 0);
                this.highlight.active = true;
                this.curHighLight = i;
                if (pos !== -1 && labelScroll) this.updateTitle(labelScroll.string);
                return;
            }
        }
        this.updateScroller();
    },

    cleanScrollList() {
        while (this.scrollContainer.children.length > 0) {
            this.modeItem.put(this.scrollContainer.children[0]);
        }
    },

    addButtonTotalPage() {
        let totalResultItem = cc.instantiate(this.scrollItem);
        let labelScroll = null;
        totalResultItem.getComponent(this.nameBetHistoryScrollItem).setIndex(-1);
        totalResultItem.parent = this.scrollContainer;
        if (totalResultItem.getComponent(cc.Label)) {
            labelScroll = totalResultItem.getComponent(cc.Label);
        } else {
            labelScroll = totalResultItem.getComponentInChildren(cc.Label);
        }
        if (labelScroll) labelScroll.string = this.summaryName;
    },

    updateTitle(data) {
        let titleMode = this.title.string;
        if (data) {
            if (data.mode && data.mode === 'normal') {
                titleMode = this.normalName;
            }
            if (!data.mode) {
                titleMode = data;
            }
        }
        this.title.string = titleMode;
    },

    requestErr() {
        cc.log("err");
        if (this.table) this.table.clearTable();
        if (this.loading) this.loading.active = false;
        if (this.errorMessage) {
            this.errorMessage.active = true;
            this.noBetDetail.active = false;
            this.hideElement();
        }
    },

    onNextButton() {
        this.currentPage += 1;
        this.curHighLight += 1;
        if (this.scrollList[this.currentPage] == "free_option") {
            this.currentPage += 1;
        }
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
        this.requestDetail(this.sessionId, this.currentPage);
    },

    onBackButton() {
        this.currentPage = this.currentPage - 1;
        if (this.scrollList[this.currentPage] == "free_option") {
            this.currentPage -= 1;
        }
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
        if (this.curHighLight >= 0) this.curHighLight -= 1;
        if (this.currentPage >= 0) {
            this.requestDetail(this.sessionId, this.currentPage);
        }
        else {
            this.updateScroller();
            this.renderTotalPage();
        }
    },

    updateScroller() {
        this.scrollView.stopAutoScroll();
        if (this.curHighLight >= 1 && this.curHighLight + 1 <= this.scrollContainer.children.length) {
            let itemLength = this.scrollContainer.children[0].width;
            let offsetX = (this.curHighLight - 1) * itemLength;
            this.scrollView.scrollToOffset(cc.v2(offsetX, 0));
        } else if (this.curHighLight == 0) {
            this.scrollView.scrollToOffset(cc.v2(0, 0));
        }
    },

    resetBoard() {
        this.currentPage = 0;
        if (this.summaryNode) this.summaryNode.opacity = 0;
        while (this.scrollContainer.children.length > 0) {
            this.modeItem.put(this.scrollContainer.children[0]);
        }
        if (this.table) {
            this.table.node.opacity = 0;
            this.table.clearTable();
        }
        if (this.labelTotalWin) {
            this.labelTotalWin.node.active = false;
            this.labelTotalWin.string = "";
        }
    },

    setToken(token, type, userId) {
        this.token = token;
        this.tokenType = type;
        this.userId = userId;
    },

    onClose() {
        this.resetBoard();
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
        if (this.summaryNode) this.summaryNode.emit('CLEAR_TOTAL_DETAIL_DATA');
        this.node.emit("SHOW_BET_HISTORY");
        this.node.active = false;
    },

    disableClose() {
        if (this.closeButton)
            this.closeButton.active = false;
    },

    updateTitleJP(data) {
        if (this.titleLayout) this.titleLayout.active = false;
        if (this.titleJP && this.listJP && this.listJP.length > 0) {
            let { latestWinJackpotInfo } = data;
            if (latestWinJackpotInfo) {
                let idJP = -1;
                arrayTypeJackpot.forEach((it, index) => {
                    if (latestWinJackpotInfo.jackpotId.indexOf(it) >= 0)
                        idJP = index;
                });
                if (this.listJP.length <= arrayTypeJackpot.length && idJP != -1) {
                    this.titleJP.getComponent(cc.Sprite).spriteFrame = this.listJP[idJP];
                    this.titleJP.active = true;
                    this.updateTitle(data);
                    let tt = this.title.getComponent(cc.Label).string;
                    this.title.getComponent(cc.Label).string = tt + " + ";
                }
            } else {
                this.titleJP.active = false;
            }
        } else {
            let { latestWinJackpotInfo } = data;
            if (latestWinJackpotInfo && data.mode != "normal") {
                this.updateTitle(data);
                let tt = this.title.getComponent(cc.Label).string;
                this.title.getComponent(cc.Label).string = tt + " + " + this.jackpotName;
            }
        }
        if (this.titleLayout) this.titleLayout.active = true;
    },

    closeNotice() {
        if (this.errorMessage) this.errorMessage.active = false;
    },
    getTypeJackpot(jackpotId) {
        for (let index = 0; index < arrayTypeJackpot.length; index++) {
            const jp = arrayTypeJackpot[index];
            if (jackpotId.includes(jp)) {
                return (index + 1);
            }
        }
        return 0;
    },

    updateWinAmt(value) {
        if (this.titleLayout) this.titleLayout.active = false;
        if (value && this.titleWinAmt) {
            this.titleWinAmt.getComponent(cc.Label).string = value;
            this.titleWinAmt.active = true;
            if (this.titleLayout) this.titleLayout.active = true;
        }
    },
    resetWinAmt() {
        if (this.titleWinAmt) {
            this.titleWinAmt.getComponent(cc.Label).string = '';
            this.titleWinAmt.active = false;
        }
    },
    hideElement() {
        if (this.titleLayout) this.titleLayout.active = false;
        this.table.node.active = false;
        if (this.summaryNode) this.summaryNode.active = false;
        this.scrollView.node.active = false;
    },
    showElement() {
        if (this.titleLayout) this.titleLayout.active = true;
        this.table.node.active = true;
        if (this.summaryNode) this.summaryNode.active = true;
        this.scrollView.node.active = true;
    },
});
