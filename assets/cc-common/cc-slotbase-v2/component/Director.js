/* global Sentry, finishDemoCallBack, CC_DEBUG */
const baseDirector = require('BaseDirectorV2');
const globalNetwork = require('globalNetwork');
const { handleFlowOutGame, handleBackLogin, getUrlParam, handleCloseGameIframe } = require("gameCommonUtils");
const { formatWalletMoney, findKeyByValue, updateUtilConfig } = require('utils');
const lodash = require('lodash');
const tutorialManager = require("TutorialMgr");
const gameNetwork = window.GameNetwork || require('game-network');
const EventManager = gameNetwork.EventManager;
const PROMOTION_ERROR = {
    WRONG_BET: '0016',
    EXPIRED: '0042',
    RESET: '0043',
    NEW: '0044',
};

cc.Class({
    extends: baseDirector,

    properties: {
        backToLobby: cc.Node,
        info: cc.Node,
        setting: cc.Node,
        bet: cc.Node,
        turbo: cc.Node,
        jackpot: cc.Node,
        wallet: cc.Node,
        gui: cc.Node,
        cutscene: cc.Node,
        normalGame: cc.Node,
        freeGame: cc.Node,
        bonusGame: cc.Node,
        gameText: cc.JsonAsset,
        gameTrialSupport: {
            default: false
        },
        realWalletAmount: {
            default: null,
            type: cc.Node
        },
        trialWalletAmount: {
            default: null,
            type: cc.Node
        },
        trialButton: {
            default: null,
            type: cc.Node
        },
        realButton: {
            default: null,
            type: cc.Node
        },
        jackpotHistory: cc.Node,
        betHistory: cc.Node,
        backgroundLoading: cc.Node,
        tutorialData: {
            type: cc.Asset,
            default: null
        },
        tutorialMgr: tutorialManager,
        toastMessage: require("ToastInfo"),
        waitingScene: cc.Node,
        demoGroup: cc.Node,
        isGamePrefab: false,
    },

    onLoad() {
        this._super();
        this.gameTrialData = this.node.trialData || null;
        if (this.tutorialData) this.tutorialSpinData = this.tutorialData.json;
        // @TODO: Refactor this code
        if (this.backgroundLoading) {
            this.backgroundLoading.active = true;
        }
        this.node.on("INGAME_EVENT_RAISED", (ev) => {
            let evName = ev.getUserData().trigger;
            this.onIngameEvent(evName);
            ev.stopPropagation();
        });
        if (this.tutorialMgr) this.tutorialMgr.setMainGameMgr(this);
        this.node.on("ENABLE_BUTTON_CONTROL", this.enableButtonControl, this);
        this.node.on("DISABLE_BUTTON_CONTROL", this.disableButtonControl, this);
        this.node.on("HIDE_TUTORIAL", this.hideTutorial, this);
        this.node.on('SET_UP_SPINE_DATABASE', this.setUpSpineDatabase.bind(this));
        this.setupGameMode();
        this.showMessageForceClose = false;
        this.networkWarningTime = 0;
        this.joinGameSuccess = false;

        const loadConfigAsync = require('loadConfigAsync');
        const { LOGIN_IFRAME } = loadConfigAsync.getConfig();
        if (LOGIN_IFRAME) {
            this.playingDemo = (getUrlParam('trialMode') === 'true');
        }
        this._setUpGameVersion();

        this.usingPopups = [this.setting, this.info, this.jackpotHistory, this.betHistory];
    },

    start() {
        this._super();
        this.loadText();
    },

    loadText() {
        if (this.gameText) {
            this.node.config.GAME_TEXT = this.gameText.json;
        }
        // this.promotionMessage = this.node.config.MESSAGE_DIALOG.PROMOTION_MESSAGE;
        // this.promotionReset = this.node.config.MESSAGE_DIALOG.PROMOTION_RESET;
        // this.promotionNew = this.node.config.MESSAGE_DIALOG.PROMOTION_NEW;
    },

    _setUpGameVersion() {
        const versionSlot = this.node.getComponentInChildren("VersionSlot");
        if (versionSlot && versionSlot.versionFile && versionSlot.versionFile.json.version) {
            if (typeof Sentry !== 'undefined') {
                Sentry.configureScope(function (scope) {
                    scope.setExtra("gameVersion", versionSlot.versionFile.json.version);
                });
            }
        }
    },

    onIngameEvent(evName) {
        this.trialMode && this.tutorialMgr && this.tutorialMgr.trigger(evName);
    },

    getGameId() {
        return this.node.gSlotDataStore.gameId;
    },

    getGameMeta() {
        //TODO implement game meta;
        let cutSceneMgr = this.cutscene.getComponent("CutsceneControl");
        return {
            'gameMode': this.currentGameMode.name,
            'cutScene': cutSceneMgr.getDisplayCutscene(),
            'lastCommand': this.currentGameMode.getComponent('SlotGameDirector').getLastCommand(),
            'scripts': this.currentGameMode.getComponent('SlotGameDirector').getRemainScripts()
        };
    },

    init() {
        // @TODO: Refactor this code
        if (this.backgroundLoading) {
            this.backgroundLoading.runAction(cc.fadeTo(0.3, 0));
        }
        if (!this.wallet) this.wallet = this.node;
        if (!this.bet) this.bet = this.node;
        if (!this.jackpot) this.jackpot = this.node;
        if (!this.turbo) this.turbo = this.node;
        if (!this.setting) this.setting = this.node;
        if (!this.cutscene) this.cutscene = this.node;
        this.readyToPlay = false;
        this.trialMode = false;

        //Register actors
        this.turbo.on("TURBO_TOGGLE", this.toggleModeTurbo, this);
        this.setting.emit("INIT");
        this.cutscene.children.forEach(element => {
            const cutsceneMode = element.getComponent('CutsceneMode');
            cutsceneMode && cutsceneMode.init(this);
        });
    },

    setUpSpineDatabase(evt) {
        evt.propagationStopped = true;
        if (evt.detail) {
            this.spineSkeletonDatabase = evt.detail.spineSkeletonDatabase;
        }
    },

    getSpineSkeletonData(spineName) {
        if (this.node && this.spineSkeletonDatabase && this.spineSkeletonDatabase.getSpineSkeletonData) {
            return this.spineSkeletonDatabase.getSpineSkeletonData(spineName);
        }
        return null;
    },

    setupGameMode() {
        this.gameModeList = [];
        if (this.normalGame) this.gameModeList.push(this.normalGame);
        if (this.freeGame) this.gameModeList.push(this.freeGame);
        if (this.bonusGame) this.gameModeList.push(this.bonusGame);
    },

    isTutorialShowing() {
        return this.tutorialMgr && this.tutorialMgr.isShowing();
    },

    isTutorialFinished() {
        return !this.tutorialMgr || this.tutorialMgr.isFinished();
    },

    enableTrialButton(enable) {
        if (this.trialButton) this.trialButton.emit("ENABLE_BUTTONS", enable);
    },
    /// do not remove this function!
    enableCheckForever() {

    },

    getServerVersion() {
        const { getUrlParam } = require('gameCommonUtils');
        const loadConfigAsync = require('loadConfigAsync');
        const { LOGIN_IFRAME } = loadConfigAsync.getConfig();
        let version = this.node.config.SERVER_VERSION || '';
        if (LOGIN_IFRAME) {
            version = getUrlParam('gameVersion') || version;
        }
        if (this.playingDemo) return 2;
        return version;
    },

    setUpGame() {
        this.resumeDelay = 0.3;
        const serverVersion = this.getServerVersion();
        this.gameStateManager = globalNetwork.registerGame({
            gameId: this.node.gSlotDataStore.gameId,
            isSlotGame: true,
            serverVersion,
            stateUpdate: this.stateUpdate.bind(this),
            userLogout: this.userLogout.bind(this),
            joinGameSuccess: this.initJP.bind(this),
            onJackpotWin: this.playJackpotWin.bind(this), //
            onNoticeJackpotWin: this.noticeJackpotWin.bind(this), //
            authFailed: this.showMessageAuthFailed.bind(this),
            tutorialData: this.tutorialSpinData,
            onNetworkFailed: this.onNetworkFailed.bind(this),
            onNetworkError: this.onNetworkError.bind(this),
            onNetworkDisconnect: this.onNetworkDisconnect.bind(this),
            onNetworkResume: this.onNetworkResume.bind(this),
            onNetworkWarning: this.onNetworkWarning.bind(this),
            onShowPopupDisconnected: this.onShowPopupDisconnected.bind(this),
            onNetworkConnected: this.onNetworkConnected.bind(this),
            onJoinGameDenied: this.onJoinGameDenied.bind(this),
            onRequestDenied: this.onRequestDenied.bind(this),
            useShortParam: this.node.config.USE_SHORT_PARAM,
            onNoticeUserWinJackpot: this.onNoticeUserWinJackpot.bind(this),
        });
        this.isHidden = false;
        cc.game.on(cc.game.EVENT_HIDE, this.onEventHide, this);
        cc.game.on(cc.game.EVENT_SHOW, this.onEventShow, this);
        if (this.playingDemo) {
            this.trialButton.setPlayDemoMode();
            if (this.demoGroup) this.demoGroup.active = true;
        }
    },

    onEventHide() {
        cc.log("GAME_HIDE");
        this.isHidden = true;
        if (this.gameStateManager) {
            this.gameStateManager.gameOnPause();
        }
    },

    onEventShow() {
        cc.log("GAME_SHOW");
        this.isHidden = false;
        if (this.gameStateManager) {
            this.gameStateManager.gameOnResume();
        }
    },

    initGameMode() {
        //Binding game modes
        if (this.normalGame) this.normalGame.init(this, true);
        if (this.freeGame) this.freeGame.init(this);
        if (this.bonusGame) this.bonusGame.init(this);

        //3 modes: normalGame, freeGame, bonusGame
        this.node.gSlotDataStore.currentGameMode = "normalGame";
        this.currentGameMode = this[this.node.gSlotDataStore.currentGameMode];

        this.gui.show();
        this.currentGameMode.enter();
    },

    extendInit(meta) { // eslint-disable-line
        //Add Override here
    },

    enableButtonInteraction() {
        if (this.normalGame) this.normalGame.emit("ENABLE_BUTTON_INTERACTION");
        if (this.freeGame) this.freeGame.emit("ENABLE_BUTTON_INTERACTION");
        if (this.bonusGame) this.bonusGame.emit("ENABLE_BUTTON_INTERACTION");
    },

    initJP(meta) {

        //Register event with server
        this.enableButtonInteraction();
        let wallet = 0;
        this.joinGameSuccess = true;
        const { extendData, dataResume, metaDataPromotion } = meta;
        if (!lodash.isEmpty(extendData)) {
            let { ec: extendCommon } = extendData;
            if (extendCommon) {
                this.extendCommonData = this.parseExtendCommonData(extendCommon);
            }
            if (this.extendCommonData && this.node.config.IS_SUPPORT_MULTI_CURRENCY) {
                this._updateCurrencyConfig();
            }
            if (this._isCurrencyError) return;
        }
        if (!lodash.isEmpty(extendData) && !lodash.isEmpty(extendData.metaDataUser) && extendData.metaDataUser.currentWalletAmount) {
            wallet = extendData.metaDataUser.currentWalletAmount;
        }
        if (!lodash.isEmpty(extendData) && !lodash.isEmpty(extendData.mBet)) {
            const listDataBet = extendData.mBet.split(',');
            let steps = {};
            listDataBet.forEach(item => {
                steps[item.split(';')[0][0]] = Number(item.split(';')[1]);
            });
            this.node.gSlotDataStore.slotBetDataStore.createDefaultBet(this.node.config, steps);
            this.updateJackpotHistoryBet(extendData.mBet);
        }
        this.bet.emit("LOAD_BET", { gameId: this.node.config.GAME_ID, betId: this.node.config.DEFAULT_BET });

        this.bet.on('BET_CHANGE', (betId) => {
            this.jackpot.emit("CHANGE_JACKPOT");
            this.tutorialMgr && this.tutorialMgr._updateJackpot();
            if (this.trialMode && betId) {
                this.updateTrialBet(betId);
            }
            this.changeBetCallback(betId);
        });
        this.jackpot.emit("REGISTER_JACKPOT", this.node.gSlotDataStore.gameId, meta, this.gameStateManager);
        this.readyToPlay = true;
        this.wallet.emit("UPDATE_WALLET", { amount: wallet });
        this.jackpotHistory && this.jackpotHistory.emit('ENABLE_BUTTONS');
        this.trialButton && this.trialButton.emit('CAN_SWITCH_MODE');

        this.extendInit(lodash.clone(meta));
        // resume from join game
        if (dataResume) {
            this.normalGame.emit("SPIN_DISABLE");
            this.disableBet();
            this.extendActionForResume();
            this.runAction('Resume', dataResume);
            if (metaDataPromotion) {
                const isResume = true;
                this.promotionUpdate(metaDataPromotion, isResume);
            }
        }
        else {
            this.normalGame.emit("SPIN_ENABLE");
            if (metaDataPromotion) {
                this.promotionUpdate(metaDataPromotion);
            } else {
                this.enableBet();
                this.enableTrialButton(true);
            }
        }
        const havingDirector = this.currentGameMode && this.currentGameMode.director;
        if (havingDirector && dataResume) {
            this.currentGameMode.director.hideAnimIntro();
        }
        if (this.playingDemo) {
            this.node.gSlotDataStore.isPlayDemo = true;
            this.setupPlayDemo();
        }
        if (this.setting) {
            this.setting.emit('ADD_TOGGLE_SWITCH_NETWORK', this.gameStateManager);
        }
    },

    setupPlayDemo() {
        this.countF2R = 0;
        this.switchToTrialMode();
        this.tutorialMgr.skipTutorial();
        this._listenActionOnButtons();
        this._detectAFK();
    },
    _listenActionOnButtons() {
        this._allButtons = this.node.getComponentsInChildren(cc.Button);
        this._allButtons.forEach(btn => {
            btn.node.on(cc.Node.EventType.TOUCH_START, () => {
                if (btn.interactable) {
                    this.node.gSlotDataStore.lastActionTime = Date.now();
                }
            });
        });
    },
    _detectAFK() {
        this.node.gSlotDataStore.timerAFK = 0;
        this.tweenDetectAFK = cc.tween(this)
            .delay(1)
            .call(() => {
                this.node.gSlotDataStore.timerAFK++;
                const { isAutoSpin, currentGameMode, timerAFK } = this.node.gSlotDataStore;
                if (currentGameMode !== 'normalGame') return;
                if (isAutoSpin) return;
                if (timerAFK > 30) this.showPopupRedirect();
            })
            .union()
            .repeatForever()
            .start();
    },
    showPopupRedirect() {
        if (!this.playingDemo) return;
        const {isAutoSpin,currentGameMode} = this.node.gSlotDataStore;
        if (this._isShowPopupRedirect) return;
        this._isShowPopupRedirect = true;
        if (currentGameMode === 'normalGame' && isAutoSpin) {
            this.currentGameMode.director.stopAutoSpinClick();
        }
        const { NAME, FINISH_DEMO } = this.node.config.MESSAGE_DIALOG;
        this.showCutscene(NAME, {
            strText: FINISH_DEMO,
            actionBtnOK: () => {
                this._isShowPopupRedirect = false;
                this.node.gSlotDataStore.timerAFK = 0;
                this.showWaitingCutScene();
                this.scheduleOnce(() => {
                    if (typeof finishDemoCallBack === 'function') {
                        finishDemoCallBack();
                    } else {
                        handleCloseGameIframe();
                    }
                }, 0.5);
            },
            actionCancel: () => {
                this._isShowPopupRedirect = false;
                this.node.gSlotDataStore.timerAFK = 0;
            }
        });
    },
    countingFastToResult() {
        if (!this.playingDemo) return;
        if (this.node.gSlotDataStore.modeTurbo === true) return;
        if (this.countF2R === null) return;
        this.countF2R++;
        if (this.countF2R === 3) {
            this.showPopupSuggestTurbo();
            this.countF2R = null;
        }
    },
    showPopupSuggestTurbo() {
        const { NAME, SUGGEST_TURBO } = this.node.config.MESSAGE_DIALOG;
        this.showCutscene(NAME, {
            strText: SUGGEST_TURBO,
            actionBtnOK: () => {
                this.turbo.emit("TURN_ON");
            },
            actionCancel: () => { }
        });
    },

    playJackpotWin(data, isMe) {
        if (!this.canNotifyJackpot(data)) return;
        if (isMe) return this.pauseJackpot();
        this.jackpot.emit("PLAY_JACKPOT_EXPLOSION", data.jpInfo);
        cc.warn('%cjackppot-win', "color: #red", JSON.stringify(data.jpInfo));
    },

    noticeJackpotWin(data, isMe) {
        if (!this.canNotifyJackpot(data)) return;
        if (isMe) return this.pauseJackpot();
        this.jackpot.emit("NOTICE_JACKPOT_WIN", data.jpInfo);
    },

    onNoticeUserWinJackpot(data, isMe) {
    },

    canNotifyJackpot(data) {
        if (!data || !data.jpInfo || 
            !this.node.config.IS_SHOW_JACKPOT_EXPLOSION || this.isHidden || 
            this.trialMode || this.node.gSlotDataStore.currentGameMode === "bonusGame") return false;
        return true;
    },

   
    stopJackpotWin() {
        if(!this.node.config.IS_SHOW_JACKPOT_EXPLOSION) return;
        if (!this.trialMode) {
            this.jackpot.emit("STOP_JACKPOT_EXPLOSION");
        }
    },
    extendActionForResume() {
        //Add your overwrite code here!
    },

    //data recieve start from here
    stateUpdate(data) {
        this.runAction('Update', data);
        if (this.tutorialMgr && this.trialMode) {
            this.tutorialMgr.onStateUpdate(data);
        }
    },
    stopSpinCurrentMode() {
        if (this.currentGameMode && this.currentGameMode.director && this.currentGameMode.director.forceStopSpinning) {
            this.currentGameMode.director.forceStopSpinning();
        }
    },
    userLogout() {
        this.logOutUser = true;
        if (!this.node) return;
        this.node.runAction(cc.sequence(
            cc.delayTime(0.3),
            cc.callFunc(() => {
                const { ANOTHER_ACCOUNT } = this.node.config.MESSAGE_DIALOG;
                this.showPopupHandleOutGame(ANOTHER_ACCOUNT, handleBackLogin);
                if (this.currentGameMode && this.currentGameMode.director && this.currentGameMode.director.table) {
                    this.currentGameMode.director.forceStopSpinning();
                    this.currentGameMode.director.table.emit('STOP_REEL_ROOL');
                }
            })
        ));
    },
    isUserLogout() {
        return this.logOutUser;
    },
    showWaitingCutScene() {
        this.isShowWaitingCutScene = true;
        this.showCutscene('waitingScene');
    },
    showPopupHandleOutGame(text, cbHandler) {
        const { NAME } = this.node.config.MESSAGE_DIALOG;
        const loadConfigAsync = require('loadConfigAsync');
        const { LOGIN_IFRAME } = loadConfigAsync.getConfig();

        if (LOGIN_IFRAME) {
            const gameCommonUtils = require('gameCommonUtils');
            const isEnableBtn = gameCommonUtils.checkConditionCloseGameIframe();
            if (isEnableBtn) {
                this.showCutscene(NAME, {
                    strText: text, actionBtnOK: () => {
                        this.showWaitingCutScene();
                        this.scheduleOnce(() => {
                            gameCommonUtils.handleCloseGameIframe();
                        }, 0.5);
                    }
                });
            } else {
                this.showCutscene(NAME, {
                    strText: text
                });
            }
        } else {
            this.showCutscene(NAME, {
                strText: text, actionBtnOK: () => {
                    this.showWaitingCutScene();
                    if (cc.sys.isNative && typeof (closeCreatorGame) === 'function') {
                        cbHandler();
                    } else {
                        this.scheduleOnce(() => {
                            cbHandler();
                        }, 0.5);
                    }
                }
            });
        }
    },
    showMessageAuthFailed() {
        if (!this.node) return;
        this.node.runAction(cc.sequence(
            cc.delayTime(0.3),
            cc.callFunc(() => {
                const { AUTHEN_FAILED } = this.node.config.MESSAGE_DIALOG;
                this.showPopupHandleOutGame(AUTHEN_FAILED, handleBackLogin);
            })
        ));
    },
    onJoinGameDenied() {
        if (!this.node) return;
        this.node.runAction(cc.sequence(
            cc.delayTime(0.3),
            cc.callFunc(() => {
                const { ACCOUNT_BLOCKED } = this.node.config.MESSAGE_DIALOG;
                this.showPopupHandleOutGame(ACCOUNT_BLOCKED, handleBackLogin);
            })
        ));
    },
    
    onRequestDenied() {
        if (!this.node) return;
        this.node.runAction(cc.sequence(
            cc.delayTime(0.3),
            cc.callFunc(() => {
                const { REQUEST_DENIED } = this.node.config.MESSAGE_DIALOG;
                this.showPopupHandleOutGame(REQUEST_DENIED, handleBackLogin);
            })
        ));
    },
    onNetworkProblem(reason) {
        if (this.logOutUser) return;

        if (reason == 'mismatch-command') {
            const { MISMATCH_DATA } = this.node.config.MESSAGE_DIALOG;
            this.showPopupHandleOutGame(MISMATCH_DATA, handleFlowOutGame);
        }
        if (this.currentGameMode && this.currentGameMode.director && this.currentGameMode.director.table) {
            this.currentGameMode.director.table.emit('STOP_REEL_ROOL');
        }
    },

    promotionUpdate(metaData, isResume = false) {
        if (metaData) {
            this.disableBet();
            if (this.node && this.node.gSlotDataStore) {
                const { betId, promotionRemain, promotionTotal } = metaData;
                this.node.gSlotDataStore.promotion = true;
                this.node.gSlotDataStore.promotionRemain = promotionRemain;
                this.node.gSlotDataStore.promotionBetId = betId;
                this.node.gSlotDataStore.promotionTotal = promotionTotal;
                this.runDelayPromtion(isResume);
            } else {
                this.node.runAction(cc.sequence(
                    cc.delayTime(this.resumeDelay),
                    cc.callFunc(() => {
                        this.currentGameMode.director.updatePromotionData(metaData);
                        this.showPromotionPopup(isResume);
                    })
                ));
                return;
            }
        }
    },

    runDelayPromtion(isResume) {
        this.node.runAction(cc.sequence(
            cc.delayTime(0.05),
            cc.callFunc(() => {
                if (this.currentGameMode && this.currentGameMode.director) {
                    this.showPromotionPopup(isResume);
                } else {
                    this.runDelayPromtion(isResume);
                }
            })
        ));
    },

    showPromotionPopup(isResume) {
        if (isResume) return;
        const { promotionRemain, promotionBetId, promotionErrorCode } = this.node.gSlotDataStore;
        const { NAME } = this.node.config.MESSAGE_DIALOG;
        const totalBetValue = this.currentGameMode.director.getTotalBetValue(promotionBetId);

        let message = this.promotionMessage.replace("{1}", promotionRemain).replace("{2}", formatWalletMoney(totalBetValue));
        if (promotionErrorCode) {
            switch (promotionErrorCode) {
                case PROMOTION_ERROR.RESET:
                    message = this.promotionReset.replace("{1}", promotionRemain).replace("{2}", formatWalletMoney(totalBetValue));
                    break;
                case PROMOTION_ERROR.NEW:
                    message = this.promotionNew.replace("{1}", promotionRemain).replace("{2}", formatWalletMoney(totalBetValue));
                    break;
            }
            this.node.gSlotDataStore.promotionErrorCode = null;
        }
        this.setUpPromotion();
        this.showCutscene(NAME, {
            strText: message, actionBtnOK: () => {
                this.stopPromotionAnim();
            }
        });
        this.showPopupPromotionAnim = cc.sequence(
            cc.delayTime(5),
            cc.callFunc(() => {
                this.cutscene.emit("CLOSE_CUTSCENE", NAME);
            })
        );
        if (this.showPopupPromotionAnim) {
            this.node.runAction(this.showPopupPromotionAnim);
        }
    },

    stopPromotionAnim() {
        if (this.node && this.showPopupPromotionAnim) {
            this.node.stopAction(this.showPopupPromotionAnim);
        }
    },

    setUpPromotion() {
        this.currentGameMode.director.runPromotionSpin();
    },

    sendSpinToNetwork(currentBetData) {
        if (this.node.gSlotDataStore.currentGameMode == "freeGame") {
            this.gameStateManager.triggerFreeSpinRequest();
        } else {
            this.gameStateManager.triggerSpinRequest(currentBetData);
        }
    },

    spinPromotion() {
        // const {promotionRemain} = this.node.gSlotDataStore;
        // this.currentGameMode.director.triggerPromotionSpin(promotionRemain);
    },

    //Preparation and transition Make modes readyss
    newGameMode({ name, data }, callback) {
        if (this[name]) {
            this.stopJackpotWin();
            this.currentGameMode.hide();
            this.node.gSlotDataStore.currentGameMode = name;
            this.currentGameMode = this[this.node.gSlotDataStore.currentGameMode];
            this.currentGameMode.enter(data, callback);
        }
    },
    resumeGameMode({ name }, callback) {
        if (this[name]) {
            this.node.gSlotDataStore.currentGameMode = name;
            this.currentGameMode = this[this.node.gSlotDataStore.currentGameMode];
            this.currentGameMode.show(callback);
        }
    },

    showCutscene(name, content, callback) {
        this.cutscene.emit("PLAY_CUTSCENE", name, content, callback);
    },

    toggleModeTurbo(isCheck) {
        this.onIngameEvent('TURBO_CLICK');
        this.node.gSlotDataStore.modeTurbo = isCheck;
    },

    setModeTurbo(value = false) {
        this.node.gSlotDataStore.modeTurbo = value;
    },

    updateBet({ betId = this.node.config.DEFAULT_BET }) {
        this.bet.emit("UPDATE_BET", betId);
    },

    disableBet(forced = false) {
        if (this.isTutorialFinished() || forced)
            this.bet.emit("DISABLE_BET");
    },

    enableBet(forced = false) {
        if (this.isTutorialFinished() || forced)
            this.bet.emit("ENABLE_BET");
    },

    _stateUpdate(script) {
        this.currentGameMode.stateUpdate(() => {
            this.executeNextScript(script);
        });
    },
    _stateResume(script) {
        this.node.runAction(cc.sequence(
            cc.delayTime(this.resumeDelay),
            cc.callFunc(() => {
                this.currentGameMode.stateResume(() => {
                    this.executeNextScript(script);
                });
            })
        ));
    },

    haveMessageDialog() {
        return this.node && this.node.config && this.node.config.MESSAGE_DIALOG && this.node.config.MESSAGE_DIALOG.NAME;
    },

    isDisplayDialog() {
        let cutSceneMgr = this.cutscene.getComponent("CutsceneControl");
        return cutSceneMgr && cutSceneMgr.isDisplayDialog();
    },

    isDisplayCutscene() {
        let cutSceneMgr = this.cutscene.getComponent("CutsceneControl");
        return cutSceneMgr && cutSceneMgr.isDisplayCutscene();
    },

    updateWallet() {
        if (!this.logOutUser && !this.node.gSlotDataStore.isUpdateWinAmount)
            this.wallet.walletController.updateMoneyWallet();
    },

    onDestroy() {
        this.stopPromotionAnim();
        if (cc.sys.isNative && typeof (closeCreatorGame) !== 'function') {
            cc.audioEngine.stopAll();
        }
        cc.game.off(cc.game.EVENT_HIDE, this.onEventHide, this);
        cc.game.off(cc.game.EVENT_SHOW, this.onEventShow, this);
    },

    setTimeScale(scale) {
        cc.director.getScheduler().setTimeScale(scale);
    },

    switchMode() {
        if (!this.gameTrialSupport || !this.readyToPlay) return;

        if (!this.trialMode) {
            this.switchToTrialMode();
            this.hideCurrentPopups();
        } else {
            this.switchToRealMode();
        }
        this.bet.emit('SWITCH_MODE', this.trialMode);
    },

    isTrialMode() {
        return this.trialMode;
    },

    updateJackpot() {
        this.jackpot.emit("CHANGE_JACKPOT");
    },

    skipTutorialMode() {
        // support GD to review feature
        const useTutorialData = getUrlParam('useTutorialData') === 'true';
        const loadConfigAsync = require('loadConfigAsync');
        const { IS_PRODUCTION } = loadConfigAsync.getConfig();
        if (!IS_PRODUCTION && CC_DEBUG && useTutorialData) {
            return;
        }
        if (this.trialMode) {
            this.gameStateManager.skipTutorial();
        }
    },

    switchToTrialMode() {
        const { MAX_BET, DEFAULT_TRIAL_WALLET } = this.node.config;
        this.trialWalletAmount.active = true;
        this.realWalletAmount.active = false;

        this.trialMode = this.node.gSlotDataStore.isTrialMode = true;
        this.gameStateManager.switchToTrial();

        if (this.trialWalletAmount.controller && this.trialWalletAmount.controller.isInit === false) {
            this.trialWalletAmount.controller.setDefaultValue(DEFAULT_TRIAL_WALLET, MAX_BET);
        }
        if (this.trialWalletAmount.controller) {
            this.trialWalletAmount.controller.resetTrialValue();
            this.node.gSlotDataStore.trialWallet = this.trialWalletAmount.controller.lastValue;
        }

        this.normalGame.emit("SWITCH_TO_TRIAL");
        if (this.tutorialMgr) {
            this.tutorialMgr.node.active = true;
            this.tutorialMgr.startTutorial();
        }
        this.disableBet();
        this.trialButton.emit('SHOW_BLOCK_INPUTS', true);
        this.jackpot.opacity = 0;
        this.storeForCheckStatusTurbo = this.node.gSlotDataStore.modeTurbo;
        if (this.node.gSlotDataStore.modeTurbo) {
            this.turbo.emit('TURN_OFF');
        }
    },

    switchToRealMode() {
        if (this.playingDemo) {
            this.showPopupRedirect();
            return;
        }
        this.trialMode = this.node.gSlotDataStore.isTrialMode = false;
        this.gameStateManager.switchToReal();
        this.normalGame.emit("SWITCH_TO_REAL");
        this.realWalletAmount.active = true;
        this.trialWalletAmount.active = false;
        if (this.tutorialMgr) {
            this.tutorialMgr.onTutorialFinish();
            this.tutorialMgr.playAnimSwitchToReal();
        }
        if (this.storeForCheckStatusTurbo) {
            this.turbo.emit('TURN_ON');
        } else {
            this.turbo.emit('TURN_OFF');
        }
        this.jackpot.opacity = 255;

        if (this.node.config.CAN_BACK_TO_REAL_MODE) {
            this.forceBackToRealMode();
        }
    },

    forceBackToRealMode() {
        this.gameStateManager.cleanUpNetWork();
        const { currentGameMode } = this.node.gSlotDataStore;
        this.node.gSlotDataStore.isAutoSpin = false;
        this.node.gSlotDataStore.spinTimes = 0;
        if (this.node.gSlotDataStore.playSession) {
            this.node.gSlotDataStore.playSession.freeGame = 0;
            this.node.gSlotDataStore.playSession.bonusGame = 0;
            this.node.gSlotDataStore.playSession.freeGameRemain = 0;
            this.node.gSlotDataStore.playSession.bonusGameRemain = 0;
        }
        const isResumeNormal = currentGameMode !== "normalGame";
        this.forceResetSoundNormalGame(isResumeNormal);
        if (isResumeNormal) {
            this.scheduleOnce(() => {
                this.resumeGameMode({ name: "normalGame"}, () => {});
            }, 1);
            if (this.bonusGame) {
                this.bonusGame.emit('FORCE_RESET_GAME_MODE', 'bonusGame');
            }
            if (this.freeGame) {
                this.freeGame.emit('FORCE_RESET_GAME_MODE', 'freeGame');
            }
        }
        if (this.normalGame) {
            this.normalGame.emit('FORCE_RESET_GAME_MODE', 'normalGame');
        }
        this.tutorialMgr && this.tutorialMgr.trigger("GAME_RESET_SESSION");
    },

    forceResetSoundNormalGame(isResumeNormal) {
        if (this.node.soundPlayer) {
            this.node.soundPlayer.stopAllEffects();
            if (isResumeNormal) {
                this.node.soundPlayer.playMainBGM();
            }
        }
    },

    showTrialButtons(isOn) {
        if (this.trialButton) {
            this.trialButton.emit("ENABLE_BUTTONS", isOn);
        }
    },

    updateWalletOnTrialSpinClick() {
        if (this.trialWalletAmount) {
            this.trialWalletAmount.controller.updateWalletOnTrialSpinClick();
            this.node.gSlotDataStore.trialWallet = this.trialWalletAmount.controller.lastValue;
        }
    },

    updateTrialWallet(winAmount = 0) {
        if (this.trialWalletAmount) {
            this.trialWalletAmount.controller.updateTrialWallet(winAmount);
            this.node.gSlotDataStore.trialWallet = this.trialWalletAmount.controller.lastValue;
        }
    },

    updateJackpotHistoryBet(mBet) {
        if (this.jackpotHistory && this.jackpotHistory.getComponent('JackpotHistory')) {
            this.jackpotHistory.getComponent('JackpotHistory').setDynamicBet(mBet);
        }
    },

    isPauseTutorialFlag(flag) {
        return this.isTutorialShowing() && this.tutorialMgr.isContainFlag(flag);
    },

    checkPauseTutorial(flag) {
        // override this function to check condition
        return this.isPauseTutorialFlag(flag) && this.trialMode;
    },

    enableButtonControl() {
        this.setting && this.setting.emit('ENABLE_BUTTONS');
        this.jackpotHistory && this.jackpotHistory.emit('ENABLE_BUTTONS');
        this.backToLobby && this.backToLobby.emit('ENABLE_BUTTONS');
        this.info && this.info.emit('ENABLE_BUTTONS');
        this.turbo && this.turbo.emit('ENABLE_BUTTONS');
    },

    disableButtonControl() {
        this.setting && this.setting.emit('DISABLE_BUTTONS');
        this.jackpotHistory && this.jackpotHistory.emit('DISABLE_BUTTONS');
        this.backToLobby && this.backToLobby.emit('DISABLE_BUTTONS');
        this.info && this.info.emit('DISABLE_BUTTONS');
        this.turbo && this.turbo.emit('DISABLE_BUTTONS');
    },

    hideCurrentPopups() {
        this.info && this.info.emit('HIDE_PANEL');
        this.setting && this.setting.emit('HIDE_PANEL');
        this.jackpotHistory && this.jackpotHistory.emit('HIDE_PANEL');

        this.setting && this.setting.emit('DISABLE_BUTTONS');
        this.jackpotHistory && this.jackpotHistory.emit('DISABLE_BUTTONS');
    },

    updateTrialBet(betId) {
        const { steps } = this.node.gSlotDataStore.slotBetDataStore.data;
        if (!findKeyByValue(steps, betId)) {
            return;
        }
        this.trialWalletAmount.controller.updateBet(betId);
    },

    pauseJackpot() {
        cc.log("jackpot paused");
        this.jackpot.emit("PAUSE_JACKPOT");
    },
    resumeJackpot() {
        cc.log("jackpot resume");
        this.jackpot.emit("RESUME_JACKPOT");
    },

    onNetworkFailed(reason) {
        cc.log('onNetworkFailed');
        if (this.showMessageForceClose) return;

        const { MESSAGE_DIALOG } = this.node.config;
        let message = MESSAGE_DIALOG.SYSTEM_ERROR;
        switch (reason) {
            case EventManager.CAN_NOT_CONNECT:
                message = MESSAGE_DIALOG.SYSTEM_ERROR;
                break;

            case EventManager.MISMATCH_DATA_VERSION:
                message = MESSAGE_DIALOG.MISMATCH_DATA;
                break;
            case EventManager.MISMATCH_COMMAND_ID:
                message = MESSAGE_DIALOG.MISMATCH_DATA;
                break;
            case EventManager.EXPECTED_EVENT_TIMEOUT:
                message = MESSAGE_DIALOG.SYSTEM_ERROR;
        }
        this.stopSpinCurrentMode();
        this.showPopupHandleOutGame(message, handleFlowOutGame);
        this.showMessageForceClose = true;
    },

    onNetworkError(code, metaData) {
        cc.log('onNetworkError');
        if (this.showMessageForceClose) return;
        const { MESSAGE_DIALOG } = this.node.config;
        let message = MESSAGE_DIALOG.SYSTEM_ERROR;
        let interruptGame = false;
        let isPromotionError = false;

        switch (code) {
            case '0000':
                code = 1000;
                interruptGame = true;
                message = MESSAGE_DIALOG.SYSTEM_ERROR;
                break;

            case 'W2408':
            case 'W2500':
            case 'W29999':
            case 'W2008':
                message = MESSAGE_DIALOG.SYSTEM_ERROR;
                break;

            case '0001':
                message = MESSAGE_DIALOG.NO_MONEY;
                break;
            case '0007':
                message = MESSAGE_DIALOG.NO_PLAYSESSION;
                interruptGame = true;
                break;
            case '0029':
                message = MESSAGE_DIALOG.GROUP_MAINTAIN;
                interruptGame = true;
                break;
            case '0014':
                message = MESSAGE_DIALOG.NO_FREESPIN_OPTION;
                interruptGame = true;
                break;
            case PROMOTION_ERROR.WRONG_BET:
            case PROMOTION_ERROR.RESET:
            case PROMOTION_ERROR.NEW:
            case PROMOTION_ERROR.EXPIRED:
                isPromotionError = true;
                break;
            case '0026':
                message = MESSAGE_DIALOG.MISMATCH_DATA;
                interruptGame = true;
                break;
            case '0035':
                message = MESSAGE_DIALOG.EVENT_ENDED;
                interruptGame = true;
                break;
            case 'W2001':
            case 'W2004':
                message = MESSAGE_DIALOG.SPIN_UNSUCCESS;
                break;
            case 'W2006':
            case 'W2007':
                message = MESSAGE_DIALOG.ACCOUNT_BLOCKED;
                break;
        }

        message = message + `\n(${code})`;

        if (isPromotionError) {
            this.handlePromotionError(metaData, code);
        } else if (interruptGame) {
            this.stopSpinCurrentMode();
            this.showPopupHandleOutGame(message, handleFlowOutGame);
            this.showMessageForceClose = true;
        } else {
            this.node.runAction(cc.sequence(
                cc.delayTime(0.3),
                cc.callFunc(() => {
                    this.showCutscene(MESSAGE_DIALOG.NAME, {
                        strText: message, actionBtnOK: () => { }
                    });
                    this.stopSpinCurrentMode();
                    this.showTrialButtons(true);
                })
            ));
        }
    },

    handlePromotionError(metaData = {}, code = '') {
        const { MESSAGE_DIALOG } = this.node.config;
        let message = MESSAGE_DIALOG.SYSTEM_ERROR;
        let propertyPath = this.node.config.USE_SHORT_PARAM ? 'promotion' : 'fields.promotion.stringValue';
        const promotionString = lodash.get(metaData, propertyPath);
        switch (code) {
            case PROMOTION_ERROR.WRONG_BET:
            case PROMOTION_ERROR.RESET:
            case PROMOTION_ERROR.NEW:
                if (promotionString) {
                    const promotionData = promotionString.split(';');
                    const updatedData = {
                        betId: promotionData[0],
                        promotionRemain: promotionData[1],
                        promotionTotal: promotionData[2]
                    };
                    this.node.gSlotDataStore.promotionErrorCode = code;
                    this.stopSpinCurrentMode();
                    this.promotionUpdate(updatedData);
                }
                break;
            case PROMOTION_ERROR.EXPIRED:
                message = MESSAGE_DIALOG.PROMOTION_EXPIRED + `\n(${code})`;
                this.node.gSlotDataStore.promotion = false;
                this.node.gSlotDataStore.promotionRemain = 0;
                this.node.gSlotDataStore.promotionTotal = 0;
                this.stopSpinCurrentMode();
                this.showCutscene(MESSAGE_DIALOG.NAME, {
                    strText: message, actionBtnOK: () => { }
                });
                break;
        }
    },

    onNetworkDisconnect() {
        if (this.logOutUser || this.showMessageForceClose || this.networkWaiting) return;
        const { DISCONNECT } = this.node.config.MESSAGE_DIALOG;
        this.showPopupHandleOutGame(DISCONNECT, handleFlowOutGame);
        this.networkWaiting = true;
    },

    onNetworkResume() {
        if (this.showMessageForceClose) return;
        if (this.networkWaiting) {
            const { NAME } = this.node.config.MESSAGE_DIALOG;
            this.cutscene.emit("CLOSE_CUTSCENE", NAME);
            this.networkWaiting = false;
        }
        if (this.isShowWaitingCutScene) {
            this.isShowWaitingCutScene = false;
            this.cutscene.emit("CLOSE_CUTSCENE", 'waitingScene');
        }
    },

    onShowPopupDisconnected() {
        if (this.logOutUser || !this.joinGameSuccess || this.networkWaiting || !this.isTutorialFinished()) return;
        const { MESSAGE_DIALOG } = this.node.config;
        this.networkWaiting = true;
        this.showPopupHandleOutGame(MESSAGE_DIALOG.NETWORK_DISCONNECT, handleFlowOutGame);
    },

    onNetworkWarning() {
        if (this.logOutUser || !this.joinGameSuccess || this.networkWaiting || !this.isTutorialFinished()) return;
        const { MESSAGE_DIALOG } = this.node.config;
        cc.log('Show toast message disconnect');
        if (!this.showMessageForceClose && this.toastMessage) {
            this.toastMessage.showMessage(MESSAGE_DIALOG.NETWORK_WARNING);
        }
    },

    onNetworkConnected() {
        if (!this.joinGameSuccess) return;
        this.networkWarningTime = 0;
        if (!this.showMessageForceClose && this.networkWaiting) {
            const { NAME } = this.node.config.MESSAGE_DIALOG;
            this.cutscene.emit("CLOSE_CUTSCENE", NAME);
            this.cutscene.emit("CLOSE_ALL_NOTICES");
            this.networkWaiting = false;
        }
        if (this.isShowWaitingCutScene) {
            this.isShowWaitingCutScene = false;
            this.cutscene.emit("CLOSE_CUTSCENE", 'waitingScene');
        }
    },

    hideTutorial() {
        this.trialButton.emit('SHOW_BLOCK_INPUTS', false);
    },

    changeBetCallback() {
        // TO DO
    },
    onDisable() {
        if (this.tweenDetectAFK) this.this.tweenDetectAFK.stop();
        this.tweenDetectAFK = null;
    },

    // parse ec="c:usd#l:vn" => extendCommonData { c: 'usd', l: 'vn' }
    parseExtendCommonData(extendCommon) {
        const properties = extendCommon.split('#');
        let extendCommonData = {};
        properties.forEach(stringValue => {
            const property = stringValue.split(':');
            const key = property[0];
            const value = property[1];
            extendCommonData[key] = value;
        });
        return extendCommonData;
    },

    _updateCurrencyConfig() {
        this.currencyCode = this._getCurrency();
        this.node.gSlotDataStore.currencyCode = this.currencyCode;

        if (this.currencyCode === this.defaultCurrency || !this.currencyCode) return;
        this._updateGameConfig();

        const currencyConfig = this.node.config.MONEY_FORMAT;
        updateUtilConfig('CURRENCY_CONFIG', currencyConfig);
    },

    _getCurrency() {
        this.defaultCurrency = this.node.config.DEFAULT_CURRENCY || 'VND';
        const serverCurrency = this.getServerCurrency();
        const clientCurrency = this.getClientCurrency();
        if (serverCurrency !== clientCurrency) return this.showCurrencyErrorPopup();
        return serverCurrency.toUpperCase();
    },

    getServerCurrency() {
        return this.extendCommonData.c && this.extendCommonData.c.toUpperCase();
    },

    _updateGameConfig() {
        const { CURRENCY_CONFIG } = this.node.config;
        if (!CURRENCY_CONFIG) return;
        const currencyConfig = CURRENCY_CONFIG[this.currencyCode.toUpperCase()];
        const updatedConfig = Object.assign(this.node.config, currencyConfig);
        this.node.config = updatedConfig;
    },

    showCurrencyErrorPopup() {
        this._isCurrencyError = true;
        const loadConfigAsync = require('loadConfigAsync');
        const { LOGIN_IFRAME } = loadConfigAsync.getConfig();
        if (LOGIN_IFRAME) {
            const { NAME, CURRENCY_NOT_SUPPORTED } = this.node.config.MESSAGE_DIALOG;
            let actionOK = () => {
                this._isCurrencyError = false;
                handleCloseGameIframe();
            };
            this.showCutscene(NAME, {
                strText: CURRENCY_NOT_SUPPORTED, actionBtnOK: actionOK
            });
        };
    },

    getClientCurrency() {
        const loadConfigAsync = require('loadConfigAsync');
        const { LOGIN_IFRAME } = loadConfigAsync.getConfig();

        if (!this.node.config.IS_SUPPORT_MULTI_CURRENCY) return '';
        let currencyCode = '';
        if (LOGIN_IFRAME) {
            currencyCode = getUrlParam('c') || this.defaultCurrency;
        } else {
            currencyCode = cc.sys.localStorage.getItem('c') || this.defaultCurrency;
        }
        return currencyCode.toUpperCase();
    },

    closePopups() {
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
        this.usingPopups.forEach(popup => {
            popup && popup.emit("CLOSE_PANEL");
        });
    }
});
