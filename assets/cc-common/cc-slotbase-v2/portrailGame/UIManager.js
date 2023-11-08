const EventListenerManager = require("EventListenerManager");
cc.Class({
    extends: cc.Component,

    properties: {
        topUI: cc.Node,
        bottomUI: cc.Node,
        menuBar: cc.Node,
        payLineWinInfo: cc.Node,
        jackpotPopup: cc.Node,
        smallToolTip: cc.Node,
        //Button
        bottomButtons: {
            type: cc.Button,
            default: [],
        },
        // popup
        // back2RealPanel: cc.Node,
        autoSpinPanel: cc.Node,
        betSelectionNode: cc.Node,
    },

    onLoad() {
        this.node.showAllUI = this.showAllUI.bind(this);
        this.node.hideAllUI = this.hideAllUI.bind(this);
        this.node.showMenuBar = this.showMenuBar.bind(this);
        this.node.hideMenuBar = this.hideMenuBar.bind(this);
        this.node.isDisplayMenuBar = this.isDisplayMenuBar.bind(this);
        this.node.isDisplayBetSelectionPanel = this.isDisplayBetSelectionPanel.bind(this);
        this.node.isDisplayAutoSpinPanel = this.isDisplayAutoSpinPanel.bind(this);

        const customEvt = new cc.Event.EventCustom('BINDING_GUI', true);
        customEvt.detail = { GUI: this.node };
        this.node.dispatchEvent(customEvt);

        this.node.on('DISABLE_MENU', this.disableMenu, this);
        this.node.on('ENABLE_MENU', this.enableMenu, this);
        this.node.on('SHOW_SMALL_TOOL_TIP', this.showSmallToolTip, this);
        this.node.on('UPDATE_WIN_AMOUNT', this.updateWinAmount, this);
        this.node.on("SHOW_INFO_SYMBOL", this.showInfoSymbol, this);
        this.node.on("HIDE_INFO_SYMBOL", this.hideInfoSymbol, this);
        this.node.on("SHOW_JACKPOT_POPUP", this.showJackpotPopup, this);
        this.node.switchToRealMode = this.switchToRealMode.bind(this);
        this.node.switchToTrialMode = this.switchToTrialMode.bind(this);
        let serviceId = this.node.config.GAME_ID || "9966";
        this.eventListenerManager = EventListenerManager.getInstance(serviceId);
    },

    start() {
        this.init();
    },

    init() {
        if (this.menuBar) this.menuBar.init();
    },

    showAllUI() {
        if (this.topUI) this.topUI.show();
        if (this.bottomUI) this.bottomUI.show();
    },

    hideAllUI() {
        if (this.topUI) this.topUI.hide();
        if (this.bottomUI) this.bottomUI.hide();
    },

    showMenuBar() {
        if(this.node.mainDirector.director.isTutorialShowing())
            return;
        if (this.isShowingMenuBar) return;
        this.isShowingMenuBar = true;
        
        this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
        this.hideInfoSymbol();
        if (this.bottomUI) this.bottomUI.hide();
        if (this.menuBar) {
            this.menuBar.opacity = 255;
            this.menuBar.show(0, () => {
                this.isShowingMenuBar = false;
                this.isShowMenuBarCompleted = true;
            });
        }
    },

    hideMenuBar(isPlaySfx = true) {
        if(!this.isShowMenuBarCompleted) return;
        this.isShowMenuBarCompleted = false;
        isPlaySfx && this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
        if (this.bottomUI) this.bottomUI.show();
        if (this.menuBar) {
            this.menuBar.hide(() => { }, () => {
                this.menuBar.opacity = 0;
                this.isShowingMenuBar = false;
            });
        }
    },

    showInfoSymbol(wLocation, symbol, spineData, spineBorder) {
        this.menuBar.opacity > 0 && this.hideMenuBar();
        if (this.betSelectionNode.isShowing) this.betSelectionNode.hide();
        if (this.eventListenerManager) {
            this.eventListenerManager.emit("SHOW_SYMBOL_PAYTABLE_INFO", wLocation, symbol, spineData, spineBorder);
        }
    },

    hideInfoSymbol() {
        if (this.eventListenerManager) {
            this.eventListenerManager.emit("HIDE_SYMBOL_PAYTABLE_INFO");
        }
    },

    showAutoSpinPanel() {
        if(this.node.mainDirector.director.isTutorialShowing())
            return;
        if (this.isShowingAutoSpinPanel) return;
        this.isShowingAutoSpinPanel = true;
        this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
        this.hideInfoSymbol();
        if (!this.autoSpinPanel) return;
        this.autoSpinPanel.opacity = 255;
        this.autoSpinPanel.show(0, () => {
            this.isShowingAutoSpinPanel = false;
            this.autoSpinPanel.showOverlay(true);
        });
    },

    hideAutoSpinPanel(isPlaySfx = true) {
        isPlaySfx && this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
        if (!this.autoSpinPanel) return;
        this.autoSpinPanel.opacity = 255;
        this.autoSpinPanel.hide(0, () => {
            this.autoSpinPanel.opacity = 0;
            this.autoSpinPanel.showOverlay(false);
            this.isShowingAutoSpinPanel = false;
        });
    },

    showBetSelectionPanel() {
        if(this.node.mainDirector.director.isTutorialShowing())
            return;
        if (this.isShowingBetPanel) return;
        this.isShowingBetPanel = true;
        this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
        this.hideInfoSymbol();
        if (!this.betSelectionNode) return;
        this.betSelectionNode.show(0, () => {
            this.isShowingBetPanel = false;
        });
    },

    hideBetSelectionPanel(isPlaySfx = true) {
        isPlaySfx && this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
        if (!this.betSelectionNode) return;
        this.betSelectionNode.hide();
    },

    showInfoPanel() {
        this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
        this.node.mainDirector.director.showCutscene("InfoPanel", {}, () => { });
    },

    hideInfoPanel() {
    },

    showPaytablePanel() {
        this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
        this.node.mainDirector.director.showCutscene("PaytablePanel", {}, () => { });
    },

    hidePaytablePanel() {
    },

    switchToRealMode() {
        this.hideOtherActivePanels();
    },

    switchToTrialMode() {
        this.scheduleOnce(this.hideOtherActivePanels, 1);
    },

    hideOtherActivePanels(){
        if(this.isDisplayMenuBar()){
            this.hideMenuBar();
        }
        if(this.isDisplayBetSelectionPanel()){
            this.hideBetSelectionPanel(false);
        }
        if(this.isDisplayAutoSpinPanel()){
            this.hideAutoSpinPanel(false);
        }
        if (this.bottomUI && this.bottomUI.opacity < 250) 
            this.bottomUI.show();
    },

    disableMenu() {
        for (let i = 0; i < this.bottomButtons.length; i++) {
            const btn = this.bottomButtons[i];
            if (btn) btn.interactable = false;
        }
    },

    enableMenu() {
        for (let i = 0; i < this.bottomButtons.length; i++) {
            const btn = this.bottomButtons[i];
            if (btn) btn.interactable = true;
        }
    },

    showSmallToolTip(data) {
        this.smallToolTip.emit('SHOW_SMALL_TOOL_TIP', data);
    },

    showBetHistoryPanel() {
        this.node.mainDirector.director.showCutscene("BetHistory", {}, () => { });
        this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
        this.hideInfoSymbol();
    },

    showJackpotPopup(data) {
        this.jackpotPopup.show(data);
    },

    hideBetHistoryPanel() {
    },

    onJackpotButtonClick(){
        this.showJackpotHistoryPanel();
        if(this.menuBar.opacity >0){
            this.hideMenuBar(false);
        }
    },

    showJackpotHistoryPanel() {
        this.node.mainDirector.director.showCutscene("JackpotHistory", {}, () => { });
        this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
        this.hideInfoSymbol();
    },

    hideJackpotHistoryPanel() {
    },

    onHideMenuBarButtonClick() {
        this.hideMenuBar(false);
    },

    onHideBetSelection() {
        if (!this.isShowingBetPanel) this.hideBetSelectionPanel(false);
    },

    onHideAutoSpinPanel() {
        if (!this.isShowingAutoSpinPanel) this.hideAutoSpinPanel(false);
    },

    updateWinAmount(winAmount) {
        this.betSelectionNode.emit('UPDATE_WIN_AMOUNT', winAmount);
    },

    isDisplayMenuBar() {
        return this.menuBar.opacity > 0;
    },

    isDisplayBetSelectionPanel(){
        return this.betSelectionNode.isShowing;
    },

    isDisplayAutoSpinPanel(){
        return this.autoSpinPanel.opacity > 0;
    },
});
