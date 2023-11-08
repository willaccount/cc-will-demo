const gameNetwork = window.GameNetwork || require('game-network');
const CommandManager = gameNetwork.CommandManager;
const EventManager = gameNetwork.EventManager;
const messageManager = gameNetwork.MessageManager.getInstance();
const lodash = require('lodash');
const playInfo = gameNetwork.PlayerInfoStateManager.getInstance();
const {logger, uuid} = gameNetwork.lib;
const {mapObjectKey} = require('utils');
const keyMapConfig = require('MsgKeyMapping');

const SLOT_STRATEGY = {
    'client-join-game-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 10000,
        recoverEvent: "DIE",
    },
    'jg': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 10000,
        recoverEvent: "DIE",
    },

    'client-normal-spin-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 5000,
        recoverEvent: "PANIC",
    },
    'ng': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 5000,
        recoverEvent: "PANIC",
    },
    'client-free-spin-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 5000,
        recoverEvent: "PANIC",
    },
    'fg': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 5000,
        recoverEvent: "PANIC",
    },
    'ngt': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 10000,
        recoverEvent: "PANIC",
    },
    'fgt': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 10000,
        recoverEvent: "PANIC",
    },
    'mgt': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 10000,
        recoverEvent: "PANIC",
    },
    'client-lightning-spin-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 5000,
        recoverEvent: "PANIC",
    },
    'client-powerup-spin-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 5000,
        recoverEvent: "PANIC",
    },

    'client-mini-game-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 5000,
        recoverEvent: "PANIC",
    },
    'mg': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 5000,
        recoverEvent: "PANIC",
    },
    'client-free-spin-option-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 5000,
        recoverEvent: "PANIC",
    },
    'fo': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 5000,
        recoverEvent: "PANIC",
    },
    'client-gamble-spin-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 5000,
        recoverEvent: "PANIC",
    },
    'client-respin-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent: 5000,
        recoverEvent: "PANIC",
    },
    'rg': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent: 5000,
        recoverEvent: "PANIC",
    },
    'glt': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 10000,
        recoverEvent: "PANIC",
    },
    'client-join-game-trial-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 10000,
        recoverEvent: "DIE",
    },
    'client-normal-game-trial-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 10000,
        recoverEvent: "DIE",
    },
    'client-free-game-trial-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 10000,
        recoverEvent: "DIE",
    },
    'client-bonus-game-trial-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 10000,
        recoverEvent: "DIE",
    },
    'client-free-game-option-trial-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 10000,
        recoverEvent: "DIE",
    },
    'fot': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 10000,
        recoverEvent: "DIE",
    },
    'client-respin-trial-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent: 5000,
        recoverEvent: "DIE",
    },
    'rgt': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent: 5000,
        recoverEvent: "DIE",
    },
    'client-gamble-game-trial-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 10000,
        recoverEvent: "DIE",
    },
    'client-lightning-game-trial-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 10000,
        recoverEvent: "DIE",
    },
    'client-powerup-game-trial-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 10000,
        recoverEvent: "DIE",
    },
    'client-free-spin-option-event-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 5000,
        recoverEvent: "PANIC",
    },
    'client-free-spin-event-request': {
        resendCount: 100, shouldWaitForACK: true, canBeDuplicated: false,
        timeWaitForEvent : 5000,
        recoverEvent: "PANIC",
    },
};

const NEW_EVENT = {
    'client-normal-spin-request' : 'ng',
    'client-free-spin-request' : 'fg',
    'client-mini-game-request' : 'mg',
    'client-free-spin-option-request' : 'fo',
    'client-respin-request': 'rg',
    'client-join-game-request' : 'jg',
    'client-normal-game-trial-request' : 'ngt',
    'client-free-game-trial-request' : 'fgt',
    'client-bonus-game-trial-request' : 'mgt',
    'client-free-game-option-trial-request' : 'fot',
    'client-respin-trial-request': 'rgt'
};
class GameStateManager {
   
    constructor ({gameData}) {
        const {
            gameId, gameTrialData, tutorialData, useShortParam, serverVersion,
        } = gameData;
        this._playerInfoStateManager = playInfo;
        this._state = GameStateManager.STATE_NORMAL;
        this.gameData = gameData;
        this.serviceId = gameId;
        this.token = this._playerInfoStateManager.getToken();
        this._commandManager = new CommandManager(gameId, 1, useShortParam ? 'cId' : 'commandId');
        this._eventManager = new EventManager();
        this.lastSuccessCommandId = '';
        this.gameCommandId = '';
        this.waitForEventData = {};
        this._lastCommandIds = [];
        this.gltCounting = 0;
        this.useShortParam = useShortParam;
        this.serverVersion = serverVersion;

        messageManager.registerGame(gameId, {
            onAck : this._commandManager.onAck.bind(this._commandManager),
            onCannotSendMessage : this._commandManager.onCannotSendMessage.bind(this._commandManager)
        }, {
            onCannotConnect : () => {
                this._gotoDieMode(EventManager.CAN_NOT_CONNECT);
            },
            onCannotAuthen : () => {
                this._cleanUp();
                cc.log('AUTHEN FAILED');
                if (typeof this.gameData.authFailed === 'function') {
                    this.gameData.authFailed();
                }
            },
            onNetworkWarning : ()=>{
                if (typeof this.gameData.onNetworkWarning === 'function') {
                    this.gameData.onNetworkWarning();
                }
            },
            onShowPopupDisconnected: () => {
                if (typeof this.gameData.onShowPopupDisconnected === 'function') {
                    this.gameData.onShowPopupDisconnected();
                }
            },
            onConnected : ()=>{
                if (typeof this.gameData.onNetworkConnected === 'function') {
                    this.gameData.onNetworkConnected();
                }
            },
            onEvent : this._eventManager.onEvent.bind(this._eventManager)
        });
        this._trialMode = false;
        this._spinTrialDataIndex = 0;
        this._spinTrialData = gameTrialData;
        this._spinTutorialData = tutorialData;
        this._setUpEventListener();
        this._handleNetworkStatusEvent();
    }

    getCurrentWallet() {
        return this._playerInfoStateManager.getWalletBalance();
    }

    switchToTrial() {
        if (this._spinTrialData && this._spinTrialData.length > 0) {
            cc.warn("TrialData is not set");
        }
        this._trialMode = true;
        this._spinTutorialIndex = 0;

        return this._trialMode;
    }

    skipTutorial(){
        this._spinTutorialIndex = 999;
    }

    switchToReal() {
        this._trialMode = false;
    }

    triggerJoinTrial()
    {
        this._clientSendRequest({
            event: 'client-join-game-trial-request',
        });
    }

    triggerSpinRequest(betId, betLines) {
        const sendData = {
            betId,
            l: (window.languageCode || 'VI'),
        };
        if (betLines) {
            sendData.betLines = betLines;
        }
        if (this._trialMode)
        {
            if (this._getNewTrialPS())
            {
                this._returnTrialPS();
            }
            else
            {
                this._clientSendRequest({
                    event: 'client-normal-game-trial-request',
                    data: sendData
                });
            }
        }
        else {
            this.requestingNewPS = true;
            this._clientSendRequest({
                event: 'client-normal-spin-request',
                data: sendData
            });
        }
    }

    triggerSpinRequestBatch1(currentBetValue) {
        if (this._trialMode)
        {
            if (this._getNewTrialPS())
                this._returnTrialPS();
            else
            {
                this._clientSendRequest({
                    event: 'client-normal-game-trial-request',
                    data: {totalBet: currentBetValue, betId: ''}
                });
            }
        }
        else
        {
            this.requestingNewPS = true;
            this._clientSendRequest({
                event: 'client-normal-spin-request',
                data: {totalBet: currentBetValue, betId: ''}
            });
        }
    }

    _getNewTrialPS() {
        if (this._spinTutorialData && this._spinTutorialIndex < this._spinTutorialData.length)
        {
            this.trialPS = lodash.cloneDeep(this._spinTutorialData[this._spinTutorialIndex]);
            this._spinTutorialIndex++;
        }
        else if (this._spinTrialData)
        {
            this.trialPS = lodash.cloneDeep(this._spinTrialData[Math.floor(Math.random()*this._spinTrialData.length)]);
        }
        else
        {
            this.trialPS = null;
        }
        this._spinTrialDataIndex = 0;

        return (this.trialPS != null);
    }

    _returnTrialPS() {

        this.lastTrialPS = this.trialPS.shift();
        if (!this.lastTrialPS) return;
        const response = {};
        response.data = this.lastTrialPS;

        cc.log("___TRIAL: response",response);
        this.gameCommandId = uuid();
        if (this.useShortParam)
            response.data[this.serviceId].data.cId = this.gameCommandId;
        else
            response.data[this.serviceId].data.commandId = this.gameCommandId;
        clearTimeout(this.spinTimer);
        this.spinTimer = setTimeout(() => {
            if (this.useShortParam) {
                this._fireEventStateUpdated(response.data[this.serviceId]);
            }
            else {
                this._fireEventStateUpdated(response);
            }
            this._spinTrialDataIndex++;
        },300);
    }

    triggerFreeSpinRequest() {
        if (this._trialMode)
        {
            if (this.trialPS)
                this._returnTrialPS();
            else
            {
                this._clientSendRequest({
                    event: 'client-free-game-trial-request',
                    data: {}
                });
            }
        }
        else
        {
            this._clientSendRequest({
                event: 'client-free-spin-request',
                data: {}
            });
        }
    }
    
    triggerFreeSpinEventRequest() {
        if (this._trialMode)
        {
            if (this.trialPS)
                this._returnTrialPS();
            else
            {
                this._clientSendRequest({
                    event: 'client-free-game-trial-request',
                    data: {}
                });
            }
        }
        else
        {
            this._clientSendRequest({
                event: 'client-free-spin-event-request',
                data: {}
            });
        }
    }

    triggerFreeSpinOption(option) {
        if (this._trialMode)
        {
            if (this.trialPS)
                this._returnTrialPS();
            else
            {
                this._clientSendRequest({
                    event: 'client-free-game-option-trial-request',
                    data: {option}
                });
            }
        }  else {
            this._clientSendRequest({
                event: 'client-free-spin-option-request',
                data: {option}
            });
        }
    }

    triggerFreeSpinEventOption(option) {
        if (this._trialMode)
        {
            if (this.trialPS)
                this._returnTrialPS();
            else
            {
                this._clientSendRequest({
                    event: 'client-free-game-option-trial-request',
                    data: {option}
                });
            }
        }  else {
            this._clientSendRequest({
                event: 'client-free-spin-option-event-request',
                data: {option}
            });
        }
    }

    triggerMiniGame(openCell) {
        if (this._trialMode)
        {
            if (this.trialPS)
                this._returnTrialPS();
            else
            {
                this._clientSendRequest({
                    event: 'client-bonus-game-trial-request',
                    data: {openCell}
                });
            }
        }
        else
        {
            this._clientSendRequest({
                event: 'client-mini-game-request',
                data: {openCell}
            });
        }
    }

    triggerLightningSpinRequest() {
        if (this._trialMode)
        {
            if (this.trialPS)
                this._returnTrialPS();
            else
            {
                this._clientSendRequest({
                    event: 'client-lightning-game-trial-request',
                    data: {}
                });
            }
        }
        else {
            this._clientSendRequest({
                event: 'client-lightning-spin-request',
                data: {}
            });
        }
    }

    triggerPowerUpSpinRequest(openCell) {
        if (this._trialMode)
        {
            if (this.trialPS)
                this._returnTrialPS();
            else
            {
                this._clientSendRequest({
                    event: 'client-powerup-game-trial-request',
                    data: {openCell}
                });
            }
        }
        else {
            this._clientSendRequest({
                event: 'client-powerup-spin-request',
                data: {openCell}
            });
        }
    }

    triggerGambleSpinRequest(openCell, totalBet) {
        if (this._trialMode)
        {
            if (this.trialPS)
            {
                if (totalBet > 0) this.trialPS.shift();
                this._returnTrialPS();
            }
            else
            {
                this._clientSendRequest({
                    event: 'client-gamble-game-trial-request',
                    data: {openCell, totalBet}
                });
            }
        } else {
            this._clientSendRequest({
                event: 'client-gamble-spin-request',
                data: {openCell, totalBet}
            });
        }
    }

    triggerRespinRequest() {
        if (this._trialMode) {
            if (this.trialPS)
                this._returnTrialPS();
            else {
                this._clientSendRequest({
                    event: 'client-respin-trial-request',
                    data: {}
                });
            }
        }
        else {
            this._clientSendRequest({
                event: 'client-respin-request',
                data: {}
            });
        }
    }

    _triggerGetLatestStatePrivate(metaData) {
        const {stateType, serviceId, objectId} = metaData;
        //Ensure do not repeat call latest state the same type
        const data = {
            serviceId,
            objectId,
            stateType
        };

        this._clientSendRequest({
            event: 'glt',
            data
        });
    }

    cleanUpForGame() {
        this._commandManager.cleanUp();
        this._eventManager.cleanUp();
        this._playerInfoStateManager.removeEvent('user-logged-out', this._fireEventUserLogOutFunc);
        if (this.timeoutLastedState)
        {
            clearTimeout(this.timeoutLastedState);
        }
    }

    cleanUpNetWork() {
        this._commandManager.clearRemainingCommand();
        this._eventManager.removeWaitingQueue();
        if (this.timeoutLastedState) {
            clearTimeout(this.timeoutLastedState);
        }
    }

    outGame() {
        if (this._outGame) return;
        this.cleanUpForGame();
        this._commandManager.unSubscribe(this.groupChannelName);
        messageManager.unregisterGame(this.serviceId);
        this._outGame = true;
    }

    networkCallbackJP(callbackJP) {
        if (this.useShortParam) {
            this._eventManager.registerEvent('jud', ({data}) => {
                callbackJP(data);
            });
        }
        else {
            this._eventManager.registerEvent('jackpot-updated', ({data}) => {
                callbackJP(data);
            });
        }
    }

    gameOnPause() {
        logger.debug('gameOnPause');
    }

    gameOnResume() {
        logger.debug('gameOnResume');
        if (this.gameCommandId) {
            logger.debug('_resumeApp has this.gameCommandId: %s', this.gameCommandId);
        }
    }

    _subscribeJPChannel(groupChannelName) {
        if (groupChannelName) {
            this.groupChannelName = groupChannelName;
            this._commandManager.subscribe(this.groupChannelName);
        }
    }

    _verifyExpectedEvent(eventData) {
        let result = false;
        const convertEvent = ['f', 'n', 'nor', 'fre', 'frO', 'bon', 'b', 'gam', 'lig', 'pow', 'adv', 'o', 'r'];
        const index = convertEvent.indexOf(eventData.event);
        if (this.useShortParam) {
            if (index >= 0)
                eventData.event = 'state-updated';
            eventData = mapObjectKey(eventData, keyMapConfig);
        }
        if (eventData.event === 'client-join-game-result') {
            let data = eventData.data;
            result = data.commandId === this.latestExecuteCommandResult && this.gameCommandId === data.commandId;
        }
        else if (eventData.event === 'client-join-trial-game-result') {
            let data = eventData.data;
            result = data.commandId === this.latestExecuteCommandResult && this.gameCommandId === data.commandId;
        }
        else if (eventData.event === 'state-updated' && this._state === GameStateManager.STATE_NORMAL) {
            let data = null;
            if (this.useShortParam) {
                data = eventData.data;
            } else {
                data = eventData.data[this.serviceId].data;
            }
            // force get latested state
            if (this.isForceGetLatestedState) {
                return false;
            }
            result = data.commandId === this.latestExecuteCommandResult && this.gameCommandId === data.commandId;
        }
        else if (eventData.event === 'state-pushed' && this._state === GameStateManager.STATE_PANIC) {
            let data = eventData.data;
            // check last event map with this.gameCommandId
            if (this.useShortParam) {
                result = (data.gameCommandId === this.gameCommandId);
            }
            else {
                if (data && data.lastEvent) {
                    result = data.commandId === this.latestExecuteCommandResult && data.lastEvent.commandId === this.gameCommandId;
                }
                else {
                    result = false;
                }
            }
        } else if  (eventData.event === 'error-pushed' && this._state === GameStateManager.STATE_NORMAL && eventData.data && eventData.data[0]) {
            let data = eventData.data;
            result = data[0].commandId === this.latestExecuteCommandResult;
            if (this.isForceGetLatestedState) {
                return false;
            }
        }

        if (result == true && typeof this.gameData.onNetworkResume === 'function') {
            this.gameData.onNetworkResume();
        }

        return result;
    }

    _checkMismatchData(eventData)
    {
        let isMismatch = false;
        //if (eventData.event === 'state-updated')
        {
            if (!this.currentPSData) //resume case
            {
                this.currentPSData = {};
                this.currentPSData.id = eventData.id;
                this.currentPSData.version = eventData.version;
                this.requestingNewPS = false;
                return;
            }

            if (this.requestingNewPS)
            {
                if (eventData.version > 1) {
                    cc.log("Mismatch data new PS, event version is " + eventData.version);
                    isMismatch = true;
                }
                else
                {
                    this.currentPSData = {id: eventData.id, version: eventData.version};
                    cc.log('Pass new PS request');
                    this.requestingNewPS = false;
                }
            }
            else
            {
                if (eventData.id == this.currentPSData.id)
                {
                    if (eventData.version == (this.currentPSData.version + 1))
                        this.currentPSData.version = eventData.version;
                    else {
                        cc.log("Mismatch data, event version is " + eventData.version);
                        isMismatch = true;
                    }
                }
            }
        }
        if (isMismatch)
        {
            cc.log('Mismatch');
            this._gotoDieMode(EventManager.MISMATCH_DATA_VERSION);
        }
    }

    _gotoNormalMode() {
        if (this._outGame) return;
        cc.log('NORMAL MODE');
        this._eventManager.removeWaitingQueue();
        this._commandManager.clearRemainingCommand();
        if (typeof this.gameData.onNetworkResume === 'function')
            this.gameData.onNetworkResume();
    }

    _gotoPanicMode() {
        if (this._outGame) return;
        cc.log('PANIC MODE');
        this._eventManager.removeWaitingQueue();
        this._commandManager.clearRemainingCommand();
        const playerUserId = this._playerInfoStateManager.getUserId();
        this._triggerGetLatestStatePrivate({stateType: this.serviceId, serviceId: this.serviceId, objectId: playerUserId});
    }

    _gotoDieMode(reason, sendGameMessage = true) {
        if (this._outGame) return;
        cc.log('DIE MODE');
        if (sendGameMessage && typeof this.gameData.onNetworkFailed === 'function') {
            this.gameData.onNetworkFailed(reason);
        }
        this._cleanUp();
    }

    _cleanUp() {
        if (this._outGame) return;
        this._outGame = true;
        this.cleanUpForGame();
        messageManager.unregisterGame(this.serviceId);
    }

    _timeoutExpectedEventHandler(event) {
        const eventRecover = SLOT_STRATEGY[event].recoverEvent;
        this._state = eventRecover;
        if (eventRecover === GameStateManager.STATE_PANIC) {
            this._gotoPanicMode();
        } else if (eventRecover === GameStateManager.STATE_DIE) {
            this._gotoDieMode(EventManager.EXPECTED_EVENT_TIMEOUT, (event === 'client-join-game-request' || event === 'jg'));
        }
    }

    _clientSendRequest({event, data = {}}) {

        const version = this.serverVersion;
        let strategy = lodash.pick(SLOT_STRATEGY[event], ['resendCount', 'shouldWaitForACK', 'canBeDuplicated']);
        data = Object.assign(data, {token: this.token, serviceId: this.serviceId});
        if (this.useShortParam) {
            data = mapObjectKey(data, keyMapConfig);
            event = NEW_EVENT && NEW_EVENT[event] ? NEW_EVENT[event] : event;
        }

        const commandId = this._commandManager.executeCommand({event, data, version}, strategy, this.useShortParam, !this.useShortParam);

        if (commandId === CommandManager.COMMAND_FAILED_CONC_OVER_LIMIT) {
            logger.error('onEnterInit -> CommandManager.COMMAND_FAILED_CONC_OVER_LIMIT');
        } else if (commandId === CommandManager.COMMAND_FAILED_DUPLICATE) {
            logger.error('onEnterInit -> CommandManager.COMMAND_FAILED_DUPLICATE');
        } else {
            this.latestExecuteCommandResult = commandId;

            this._waitForNetwork(event);

        }
    }

    _waitForEvent(event) {
        let waitForEventId = this._eventManager.waitForEvent(
            SLOT_STRATEGY[event].timeWaitForEvent,
            this._verifyExpectedEvent.bind(this),
            this._timeoutExpectedEventHandler.bind(this, event)
        );

        if (this.gameCommandId) {
            this.waitForEventData = {
                waitForEventId,
                event
            };
        }
    }

    _waitForNetwork(event) {
        this._eventManager.waitForEvent(
            SLOT_STRATEGY[event].timeWaitForEvent,
            this._verifyExpectedEvent.bind(this),
            () => {
                if ((event === 'jg' || event === 'client-join-game-request') && this.hasJoinGameAck) {
                    return;
                }
                if (typeof this.gameData.onNetworkDisconnect === 'function')
                    this.gameData.onNetworkDisconnect();
            }
        );
    }

    _setUpEventListener() {
        let code = '';
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGIN_IFRAME, URL_CODE} = loadConfigAsync.getConfig();
        let env = 1;
        if (LOGIN_IFRAME) {
            const {getUrlParam} = require('gameCommonUtils');
            code = getUrlParam(URL_CODE);
            env = 2;
        }
        this.hasJoinGameAck = false;
        this._clientSendRequest({
            event: 'client-join-game-request',
            data: {code, env}
        });
        this._bindingEvents();
    }

    _bindingEvents() {
        let self = this;
        this._fireEventUserLogOutFunc = () => {
            self.isLogOut = true;
            if (typeof self.gameData.userLogout === 'function') {
                self.gameData.userLogout();
            }
            self._cleanUp();
        };
        this._playerInfoStateManager.registerEvent('user-logged-out', this._fireEventUserLogOutFunc);
        this._eventManager.registerEvent('client-join-game-result', this._fireEventJoinGameResult.bind(this));
        this._eventManager.registerEvent('join-game-denied', this._fireEventJoinGameDenied.bind(this));
        this._eventManager.registerEvent('state-updated', this._fireEventStateUpdated.bind(this));
        this._eventManager.registerEvent('nor', this._fireEventStateUpdated.bind(this));
        this._eventManager.registerEvent('fre', this._fireEventStateUpdated.bind(this));
        this._eventManager.registerEvent('n', this._fireEventStateUpdated.bind(this));
        this._eventManager.registerEvent('f', this._fireEventStateUpdated.bind(this));
        this._eventManager.registerEvent('r', this._fireEventStateUpdated.bind(this));
        this._eventManager.registerEvent('o', this._fireEventStateUpdated.bind(this));
        this._eventManager.registerEvent('frO', this._fireEventStateUpdated.bind(this));
        this._eventManager.registerEvent('bon', this._fireEventStateUpdated.bind(this));
        this._eventManager.registerEvent('b', this._fireEventStateUpdated.bind(this));
        this._eventManager.registerEvent('gam', this._fireEventStateUpdated.bind(this));
        this._eventManager.registerEvent('lig', this._fireEventStateUpdated.bind(this));
        this._eventManager.registerEvent('pow', this._fireEventStateUpdated.bind(this));
        this._eventManager.registerEvent('adv', this._fireEventStateUpdated.bind(this));
        this._eventManager.registerEvent('state-pushed', this._fireEventStatePushed.bind(this));
        this._eventManager.registerEvent('error-pushed', this._fireEventErrorPushed.bind(this));
        this._eventManager.registerEvent('request-denied', this._fireEventRequestDenied.bind(this));
        if (this.useShortParam) {
            this._eventManager.registerEvent('jackpot-win', this._fireEventNoticeJackpotWin.bind(this));
            this._eventManager.registerEvent('JPA', this._fireEventJackpotWin.bind(this));
        } else {
            this._eventManager.registerEvent('jackpot-win', this._fireEventJackpotWin.bind(this));
            this._eventManager.registerEvent('JPA', this._fireEventNoticeUserWinJackpot.bind(this));
        }
        this._commandManager.registerEvent(CommandManager.COMMAND_SEND_SUCCESSFULLY, this._handleCommandSendSuccessfully.bind(this));
    }

    _handleCommandSendSuccessfully( commandPayload ) {
        let commandId = commandPayload.data.commandId || commandPayload.data.cId;
        let event = commandPayload.event;
        if (event !== 'glt') {
            this.gameCommandId = commandId;
        }
        if (event === 'jg' || event === 'client-join-game-request') {
            this.hasJoinGameAck = true;
        }
        if (commandId === this.latestExecuteCommandResult) {
            this._saveNewCommandId(commandId);
            this._waitForEvent(event);
        }
    }

    _saveNewCommandId(commandId){
        if(this._lastCommandIds.length >= 10){
            this._lastCommandIds.shift();
        }
        this._lastCommandIds.push(commandId);
    }

    _handleNetworkStatusEvent() {
        this._eventManager.registerEvent(EventManager.CAN_NOT_CONNECT, () =>{
            this._state = GameStateManager.STATE_DIE;
            this._gotoDieMode(EventManager.CAN_NOT_CONNECT);
        });
        this._eventManager.registerEvent(EventManager.CONNECTED, () =>{

        });
    }

    _fireEventErrorPushed({data}) {
        if (this.isForceGetLatestedState) return;
        if (this.useShortParam) {
            data = mapObjectKey(data, keyMapConfig);
        }
        if (lodash.isArray(data) && data[0]) {
            const errorCode = data[0].code;
            const metaData = data[0].metaData;
            //wallet error
            if (errorCode[0] == 'W' || errorCode == '0000' || errorCode == '0001') {
                this.gameData.onNetworkError(errorCode, metaData);
                this._state = GameStateManager.STATE_NORMAL;
                if (this.timeoutLastedState)
                {
                    clearTimeout(this.timeoutLastedState);
                }
                this._gotoNormalMode();
            }
            else if (errorCode == '0030' && this._state == GameStateManager.STATE_PANIC) { //server is inprogress
                this.gltCounting = 0;
            }
            else {
                this._state = GameStateManager.STATE_NORMAL;
                this.gameCommandId = ''; this.waitForEventData = {};

                if (typeof this.gameData.onNetworkError === 'function') {
                    this.gameData.onNetworkError(errorCode, metaData);
                    if (this.timeoutLastedState)
                    {
                        clearTimeout(this.timeoutLastedState);
                    }
                }
            }
        }
    }

    _fireEventJoinGameResult({data}) {
        if (this.useShortParam) {
            data = mapObjectKey(data, keyMapConfig);
        }
        this._state = GameStateManager.STATE_NORMAL;
        if (typeof this.gameData.joinGameSuccess === 'function' && data.commandId === this.gameCommandId) {
            const playerUserId = this._playerInfoStateManager.getUserId();
            const {extendData} = data;

            this._subscribeJPChannel(data.groupChannelName);
            let dataJoinGame = lodash.cloneDeep(data);
            if (dataJoinGame[playerUserId] && dataJoinGame[playerUserId].isFinished === false) {
                dataJoinGame.dataResume = dataJoinGame[playerUserId];
                this.currentPSData = {};
                this.currentPSData.id = dataJoinGame.dataResume.id;
                this.currentPSData.version = dataJoinGame.dataResume.version;
                this.requestingNewPS = false;
            }



            if (this.useShortParam) {
                if (lodash.isEmpty(extendData.metaDataUser) || !extendData.metaDataUser) {
                    dataJoinGame.extendData.metaDataUser = {};
                    dataJoinGame.extendData.metaDataUser.currentWalletAmount = this.getCurrentWallet() || 0;
                }
                if (!lodash.isEmpty(extendData.metaDataPromotion) && !extendData.metaDataPromotion.status) {
                    dataJoinGame.metaDataPromotion = extendData.metaDataPromotion;
                }
            } else {
                if (!lodash.isEmpty(extendData.metaDataPromotion) && extendData.metaDataPromotion.status === 0) {
                    dataJoinGame.metaDataPromotion = extendData.metaDataPromotion;
                }
            }

            // if (CC_DEV) {
            //     dataJoinGame.metaDataPromotion = {
            //         betId: '43',
            //         serviceId: '9990',
            //         promotionRemain: 3,
            //         promotionTotal: 3,
            //         promotionCode: '1234'
            //     };
            // };

            delete dataJoinGame[playerUserId];
            this.gameCommandId = ''; this.waitForEventData = {};
            this.gameData.joinGameSuccess(dataJoinGame);
        }
    }

    _fireEventJoinGameDenied() {
        this.outGame();
        this.gameData.onJoinGameDenied();
    }

    _fireEventRequestDenied() {
        this.outGame();
        this.gameData.onRequestDenied();
    }

    _fireEventStateUpdated({data}) {
        if (this.useShortParam) {
            data = mapObjectKey(data, keyMapConfig);
        }
        if (this._state === GameStateManager.STATE_NORMAL && typeof this.gameData.stateUpdate === 'function') {
            let commandId = '';
            if (this.useShortParam) {
                commandId = data.commandId;
            }
            else {
                commandId = data[this.serviceId].data.commandId;
            }
            // force get latest state
            if (this.isForceGetLatestedState) return;
            if (this.gameCommandId === commandId) {
                this.lastSuccessCommandId = this.gameCommandId;
                this.gameCommandId = ''; this.waitForEventData = {};
                this.latestExecuteCommandResult = '';
                let dataRes = null;
                if (this.useShortParam) {
                    dataRes = data;
                } else {
                    dataRes = data[this.serviceId].data;
                }
                this.gameData.stateUpdate(dataRes);
                if (!this._trialMode) this._checkMismatchData(dataRes);
            }
        }
    }

    _fireEventNoticeJackpotWin({ data }) {
        if (this._state === GameStateManager.STATE_NORMAL && typeof this.gameData.onNoticeJackpotWin === 'function') {
            const commandId = data.jpInfo[0].cmdId || data.jpInfo[0].cId;
            const isMe = this._lastCommandIds.includes(commandId);
            this.gameData.onNoticeJackpotWin(data, isMe);
        }
    }

    _fireEventJackpotWin({data}){
        if (this._state === GameStateManager.STATE_NORMAL && typeof this.gameData.onJackpotWin === 'function' ){
            const commandId = data.jpInfo[0].cmdId || data.jpInfo[0].cId;
            const isMe = this._lastCommandIds.includes(commandId);
            this.gameData.onJackpotWin(data, isMe);
        }
    }

    _fireEventNoticeUserWinJackpot({data}){
        if (this._state === GameStateManager.STATE_NORMAL && typeof this.gameData.onJackpotWin === 'function' ){
            const commandId = data.jpInfo[0].cmdId || data.jpInfo[0].cId;
            const isMe = this._lastCommandIds.includes(commandId);
            this.gameData.onNoticeUserWinJackpot(data, isMe);
        }
    }

    _fireEventStatePushed({data}) {
        let gameCommandId = null;
        if (this.useShortParam) {
            data = mapObjectKey(data, keyMapConfig);
            gameCommandId = data.gameCommandId;
        }
        else {
            if (data && data.lastEvent) {
                gameCommandId = data.lastEvent.commandId;
            } else if (data && data.error && data.error[0]) {
                gameCommandId = data.error[0].commandId;
            }
        }
        if (this._state === GameStateManager.STATE_PANIC && typeof this.gameData.stateUpdate === 'function' && gameCommandId) {

            if (gameCommandId === this.gameCommandId)
            {
                this.gltCounting = 0;
                this.lastSuccessCommandId = this.gameCommandId;
                this._state = GameStateManager.STATE_NORMAL;
                this.gameCommandId = ''; this.waitForEventData = {};
                this._gotoNormalMode();
                const { error } = data;
                if (lodash.isArray(error) && error[0] && typeof this.gameData.onNetworkError === 'function') {
                    const errorCode = error[0].code;
                    const metaData = error[0].metaData;
                    this.gameData.onNetworkError(errorCode, metaData);
                } else {
                    this.gameData.stateUpdate(data);
                    this.currentPSData = {};
                    this.currentPSData.id = data.id;
                    this.currentPSData.version = data.version;
                }
                this.requestingNewPS = false;
                if (this.timeoutLastedState) {
                    clearTimeout(this.timeoutLastedState);
                }
            }
            else if (this.gltCounting < 10)
            {
                this.gltCounting += 1;
                this.timeoutLastedState = setTimeout( () => {
                    this._gotoPanicMode();
                }, 2000);
            }
            else {
                let commandId = (this.useShortParam) ? data.commandId : data.lastEvent.commandId;
                cc.log("Mismatch command " + " lasted " + this.lastSuccessCommandId + " current " + commandId);
                this._gotoDieMode(EventManager.MISMATCH_COMMAND_ID);
            }
        }
    }

    onForceGetLatestedState(isOn = false) {
        this.isForceGetLatestedState = isOn;
        cc.log('To click force get latested state: ', isOn);
    }
}

GameStateManager.STATE_NORMAL = 'NORMAL';
GameStateManager.STATE_PANIC = 'PANIC';
GameStateManager.STATE_DIE = 'DIE';


module.exports = GameStateManager;
