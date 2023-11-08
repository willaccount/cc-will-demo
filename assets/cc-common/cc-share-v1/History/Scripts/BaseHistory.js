const serviceRest = require('serviceRest');

cc.Class({
    extends: cc.Component,

    properties: {
        table: cc.Node,
        pageIndexView: cc.Node,
        itemPerPage: 7,
        loading: cc.Node,
        backBtn: cc.Node,
        nextBtn: cc.Node,
        errorMessage: cc.Node,
        hasExtraBet: false,
    },

    onLoad()
    {
        this.initBase();
        this.isError= false;
    },

    initBase()
    {
        this.currentPage = 1;
        this.totalPage = 1;
        this.pageDefault = 1;
        this.stopLoading();
        this.node.on("CLOSE_NOTICE", this.closeNotice, this);
        if (this.node.soundPlayer)
        {
            this.playSoundClick = this.node.soundPlayer.playSFXClick.bind(this.node.soundPlayer);
        }
        this.table.getComponent('BaseTableHistory').initCells(this.itemPerPage);

        this.serverMessage = cc.instantiate(this.errorMessage);
        this.serverMessage.setParent(this.errorMessage.parent);
        this.serverMessage.active = false;

        this.nextBtn.on(cc.Node.EventType.TOUCH_START, this.onNextPage.bind(this));
        this.nextBtn.on(cc.Node.EventType.TOUCH_END, this.cancelChangePage.bind(this));
        this.nextBtn.on(cc.Node.EventType.TOUCH_CANCEL, this.cancelChangePage.bind(this));
        this.nextBtn.on(cc.Node.EventType.MOUSE_LEAVE, this.cancelChangePage.bind(this));

        this.backBtn.on(cc.Node.EventType.TOUCH_START, this.onPrevPage.bind(this));
        this.backBtn.on(cc.Node.EventType.TOUCH_END, this.cancelChangePage.bind(this));
        this.backBtn.on(cc.Node.EventType.TOUCH_CANCEL, this.cancelChangePage.bind(this));
        this.backBtn.on(cc.Node.EventType.MOUSE_LEAVE, this.cancelChangePage.bind(this));
    },

    onNextPage() {
        if (this.nextBtn.getComponent(cc.Button).interactable) {
            this.backBtn.getComponent(cc.Button).interactable = false;
        }
    },

    onPrevPage() {
        if (this.backBtn.getComponent(cc.Button).interactable) {
            this.nextBtn.getComponent(cc.Button).interactable = false;
        }
    },

    cancelChangePage() {
        if (this.currentPage !== 1) this.backBtn.getComponent(cc.Button).interactable = true;
        if (this.currentPage < this.totalPage) this.nextBtn.getComponent(cc.Button).interactable = true;
    },

    openPanel(){
        this.node.active = true;
        this.node.opacity = 255;
        if (this.table) this.table.opacity = 0;
        this.currentPage = 1;
        if (this.currentPage == 1) {
            this.backBtn.getComponent(cc.Button).interactable = false;
            this.nextBtn.getComponent(cc.Button).interactable = false;
        }
        this.updatePageIndexView(this.currentPage);
        if (this.errorMessage) this.errorMessage.active = false;
        this.playLoading();
        this.requestDataPage(this.currentPage, this.itemPerPage, this.onRequestResponse.bind(this), this.requestErr.bind(this));
    },
    setDynamicBet(mBet = "") {
        const listDataBet = mBet.split(',');
        const listBetId = listDataBet.map(item => item.split(';')[0]);
        this.betIds = listBetId.join('-');
    },
    playLoading(){
        this.loading.active = true;
        let anim = this.loading.getComponent(cc.Animation);
        anim.wrapMode = cc.WrapMode.Loop;
        anim.play('animLoading');
    },
    stopLoading(){
        this.loading.active = false;
        let anim = this.loading.getComponent(cc.Animation);
        anim.stop('animLoading');
    },
    onNextButton()
    {
        if (this.playSoundClick) this.playSoundClick();
        this.nextBtn.getComponent(cc.Button).interactable = false;
        if (!this.isError) this.pageDefault = this.currentPage;
        this.currentPage += 1;
        if (this.isError) this.currentPage = this.pageDefault;
        this.playLoading();
        this.requestDataPage(this.currentPage, this.itemPerPage, this.onRequestResponse.bind(this), this.requestErr.bind(this));
    },
    onPreviousButton()
    {
        if (this.playSoundClick) this.playSoundClick();
        if(this.currentPage == 1) return;
        this.backBtn.getComponent(cc.Button).interactable = false;
        if (!this.isError) this.pageDefault = this.currentPage;
        this.currentPage -= 1;
        if (this.isError) this.currentPage = this.pageDefault;
        this.playLoading();
        this.requestDataPage(this.currentPage, this.itemPerPage, this.onRequestResponse.bind(this), this.requestErr.bind(this));
    },
    requestDataPage(page, quantity, callback, callbackErr)
    {
        let from = (page - 1) * quantity;
        let betIds = this.betIds;
        if (this.betIds && this.hasExtraBet && this.node.gSlotDataStore && this.node.gSlotDataStore.slotBetDataStore && this.node.gSlotDataStore.slotBetDataStore.data.extraSteps) {
            let listBetIds = this.betIds.split('-');
            const extraSteps = this.node.gSlotDataStore.slotBetDataStore.data.extraSteps;
            betIds = '';
            Object.keys(extraSteps).forEach((key, index) => {
                listBetIds = listBetIds.map(item => {
                    return item[0] + '' + key;
                });
                if (index > 0) {
                    betIds += '-';
                }
                betIds += listBetIds.join('-');
            });
        }

        let requestParams = {
            serviceId: this.jpPrefix + this.gameId,
            from: from,
            size: quantity,
            type: this.jpList,
            betIds: betIds
        };
        if (this.errorMessage) this.errorMessage.active = false;
        this.requestHistory(requestParams, callback, callbackErr);
    },
    requestHistory(requestParams = {}, callback, callbackErr, headers = null)
    {
        if (!this.gameId)
        {
            cc.warn("GameId has not been set");
            callback({});
            return;
        }

        const currencyCode = this.getCurrencyCode();
        if (currencyCode) {
            requestParams.c = currencyCode;
        }
        if (headers)
        {
            serviceRest.getWithHeader({
                url: this.url,
                params: requestParams,
                callback,
                callbackErr,
                headers
            });
        }
        else
        {
            serviceRest.get({
                url: this.url,
                params: requestParams,
                callback,
                callbackErr
            });
        }
    },
    requestErr()
    {
        this.totalPage = 1;
        this.stopLoading();
        if (this.errorMessage){
            this.errorMessage.active = true;
            this.isError= true;
            this.nextBtn.getComponent(cc.Button).interactable = false;
            this.backBtn.getComponent(cc.Button).interactable = false;
            this.table.emit('CLEAR_DATA');
        }
    },
    onRequestResponse(res)
    {
        if (res.total) {
            this.totalPage = Math.ceil(res.total / this.itemPerPage);
        }
        this.stopLoading();
        if (!res.error)
        {
            this.isError = false;
            if (Object.keys(res).length > 0 && res.data && res.data.length > 0) {
                this.nextBtn.getComponent(cc.Button).interactable = true;
                this.backBtn.getComponent(cc.Button).interactable = true;
                this.updatePageIndexView(this.currentPage);
                if (this.table) this.table.opacity = 255;
                this.table.emit('UPDATE_DATA',res.data);
                if (this.currentPage == 1)
                {
                    this.backBtn.getComponent(cc.Button).interactable = false;
                }
                if(res.total <= this.currentPage * this.itemPerPage || res.data.length < this.itemPerPage) {
                    this.nextBtn.getComponent(cc.Button).interactable = false;
                    return;
                }
            } else {
                // Clear old history items if use tool
                this.nextBtn.getComponent(cc.Button).interactable = false;
                this.backBtn.getComponent(cc.Button).interactable = false;
                this.updatePageIndexView(1);
                this.currentPage = 1;
                this.totalPage = 0;
                this.table.emit('UPDATE_DATA',res.data);
            }
        }
    },

    updatePageIndexView(content) {
        this.pageIndexView.getComponent(cc.Label).string = content;
    },

    closeNotice(){
        if (this.errorMessage) this.errorMessage.active = false;
    },

    getCurrencyCode() {
        if (this.node.gSlotDataStore && this.node.gSlotDataStore.currencyCode) {
            return this.node.gSlotDataStore.currencyCode;
        }
        return null;
    }
});
