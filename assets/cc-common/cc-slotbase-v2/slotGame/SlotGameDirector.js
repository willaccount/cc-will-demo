/* global ingameDeposit */

const baseDirector = require('BaseDirectorV2');
const TurnBaseFSM = require('turnBaseFSM');
const lodash = require('lodash');

cc.Class({
    extends: baseDirector,

    properties: {
        winAmount: cc.Node,
        buttons: cc.Node,
        table: cc.Node,
        spinTimes: cc.Node,
        isAlwaysAutoSpin: false,
        autoSpin:{
            get(){
                return this._autoSpin;
            },
            set(value){
                this._autoSpin = value;
            },

            visible: false,
        },

        beginToExit:{
            get(){
                return this._beginToExit;
            },
            set(value){
                this._beginToExit = value;
            },

            visible: false,
        },
    },
    onExtendedLoad() {
        this.node.on("GAME_UPDATE",this.stateUpdate,this);
        this.node.on("GAME_RESUME",this.stateResume,this);
        this.node.on("GAME_ENTER",this.ready,this);
        this.node.on("GAME_INIT",this.init,this);
        this.node.on("SWITCH_TO_TRIAL",this.switchToTrial,this);
        this.node.on("SWITCH_TO_REAL",this.switchToReal,this);
        this.node.on("ENABLE_BUTTON_INTERACTION",this.enableButtonInteraction,this);
        this.node.on("SPIN_DISABLE", this.disableSpin, this);
        this.node.on("SPIN_ENABLE", this.enableSpin, this);
        this.node.on("RUN_CONTINUE_SCRIPT",this.runContinueScript,this);
        this.node.on("FORCE_TO_EXIT", this.forceToExit, this);
        this.node.on("UPDATE_TEXT_WIN", this.updateTextWin, this);
        this.node.on("TRIGGER_FREE_SPIN_OPTION", this.freeSpinOptionTrigger, this);
        this.node.on("FORCE_RESET_GAME_MODE", this.forceResetGameMode, this);
        this._resetStoreScript();
    },

    init() {
        this.fsm = new TurnBaseFSM();
        this.fsm.GAME_MODE = this.node.name; // for debug state-machine
        this.writer = this.node.writer;

        if (!this.spinTimes) this.spinTimes = this.node;
        if (!this.winAmount) this.winAmount = this.node.mainDirector.gui.getWinAmount();

        if (!this.table) this.table = this.node;
        this.table.emit("INIT");

        if (!this.payline) this.payline = this.node;

        //We are ready
        this.runAction('GameStart');
        this.extendInit();

        this._autoSpin = false;
        this._beginToExit = false;
        this.isStopRunning = true;
    },
    extendInit(){
        //Add your overwrite code here!
    },

    enableButtonInteraction(){
        if (!this.buttons) this.buttons = this.node;
        this.buttons.on("SPIN_CLICK",this.spinClick,this);
        this.buttons.on("SPACE_PRESSED", this.onSpacePressed, this);
        this.buttons.on("FAST_TO_RESULT_CLICK",this.fastToResultClick,this);
        this.buttons.on("MULTI_SPIN_1_CLICK",this.multiSpin1Click,this);
        this.buttons.on("MULTI_SPIN_2_CLICK",this.multiSpin2Click,this);
        this.buttons.on("MULTI_SPIN_3_CLICK",this.multiSpin3Click,this);
        this.buttons.on("MULTI_SPIN_4_CLICK",this.multiSpin4Click,this);
        this.buttons.on("STOP_AUTO_SPIN_CLICK",this.stopAutoSpinClick,this);
        this.buttons.on("CHECK_AUTO_SPIN_FLAG",this.checkAutoSpinFlag,this);
        this.buttons.on("ON_TOUCH_START",this.onTouchStartSpinButton,this);
        this.buttons.on("ON_TOUCH_CANCEL",this.onTouchCancelSpinButton,this);
    },
    onTouchStartSpinButton(){
        this._showTrialButtons(null, false);
        this.node.mainDirector.disableBet();
        if(this._callBackEnableButtons){
            this.unschedule(this._callBackEnableButtons);
        }
    },

    onTouchCancelSpinButton(){
        if(this._callBackEnableButtons){
            this.unschedule(this._callBackEnableButtons);
        }
        this._callBackEnableButtons = ()=>{
            if(this.node.gSlotDataStore.playSession.isFinished !== false && this.isStopRunning) {
                this.node.mainDirector.enableBet();
                this._showTrialButtons(null, true);
            }
            this._callBackEnableButtons = null;
        };
        this.scheduleOnce(this._callBackEnableButtons, 0.2);
    },

    stateUpdate(callback) {
        this.callbackStateUpdate = callback;
        this.runAction('ResultReceive');
    },
    stateResume() {
        this.fsm.gameResume();
        this.runAction('Resume');
    },
    switchToTrial(){
        const {MAX_BET} = this.node.config;
        const {currentBetData} = this.node.gSlotDataStore.slotBetDataStore.data;
        this._realBetData = Number(currentBetData);
        this.node.gSlotDataStore.slotBetDataStore.updateCurrentBet(MAX_BET);
        this.node.mainDirector.bet.emit("UPDATE_BET_VALUE", MAX_BET);

        this.runAction("SwitchMode");
    },
    switchToReal(){
        this.node.gSlotDataStore.slotBetDataStore.updateCurrentBet(this._realBetData);
        this.node.mainDirector.bet.emit("UPDATE_BET_VALUE", this._realBetData);
        this.runAction("SwitchMode");
    },

    forceStopSpinning() {
        this.stopAutoSpinClick();

        const { promotion, promotionRemain, promotionTotal } = this.node.gSlotDataStore;
        if (promotionTotal && promotion && this.node.gSlotDataStore.currentGameMode == "normalGame") {
            let spinTimes = promotionTotal == promotionRemain ? Number(promotionTotal) : (Number(promotionRemain || 0) + 1);
            this.spinTimes.emit("UPDATE_SPINTIMES", spinTimes);
            this.node.gSlotDataStore.promotionRemain = spinTimes;
        }
        this.node.gSlotDataStore.isUpdateWinAmount = false;

        if(this._callBackAutoSpin) {
            this.unschedule(this._callBackAutoSpin);
        }
        this.resetPlaysessionDataLastSpin();
        this.table.emit('STOP_REEL_WITH_RANDOM_MATRIX', () => {
            this.isStopRunning = true;
        });
        this.fsm.resultReceive();
        this.fastToResultClick();
        this.runAction('GameFinish');
        this.scheduleOnce(() => {
            this._gameRestart();
        }, this.node.config.DELAY_FORCE_STOP_SPINNING ? this.node.config.DELAY_FORCE_STOP_SPINNING : 0.6);
    },

    resetPlaysessionDataLastSpin() {
        // Reset data last spin here
        if (!this.node.gSlotDataStore.playSession) return;
        if (this.node.gSlotDataStore.playSession.winAmount) {
            this.node.gSlotDataStore.playSession.winAmount = 0;
        }
        if (this.node.gSlotDataStore.playSession.winAmountPS) {
            this.node.gSlotDataStore.playSession.winAmountPS = 0;
        }
    },

    forceSpinning() {
        this.fsm.actionTrigger();
        this.node.mainDirector.disableBet();
        this.table.emit('START_SPINNING');
    },

    _updateJackpot(script) {
        this.node.mainDirector.updateJackpot();
        this.executeNextScript(script);
    },
    //This to ensure next script was tirgger after game mode state update
    runCallbackStateUpdate() {
        if (this.callbackStateUpdate && typeof this.callbackStateUpdate == "function") {
            this.callbackStateUpdate();
            this.callbackStateUpdate = null;
        }
    },
    ready(matrix) {
        if (matrix) {
            this.table.emit("CHANGE_MATRIX",{matrix});
            this.table.emit("CLEAR_PAYLINES");
        }
        // this.runAction('GameStart');
        //NEED TO CHECK WHEN RESUME??? OR RENAME IT TO INIT SETUP
        this.buttons.emit('SPIN_SHOW');
        this.buttons.emit('SPIN_ENABLE');
        this.buttons.emit('STOP_AUTO_SPIN_HIDE');

        //Turn on when enter
        if (this.isAlwaysAutoSpin) {
            this.runAction('SpinByTimes', 999999);  
        } else {
            this.buttons.emit('FAST_TO_RESULT_HIDE');
        }
        this.node.mainDirector.onIngameEvent("ENTER_GAME_MODE");
    },

    checkStatusRunning() {
        return this.isStopRunning;
    },

    //Binding methods that called from controller
    stopAutoSpinClick() {
        this.buttons.emit('STOP_AUTO_SPIN_HIDE');
        this.runAction('DisableAutoSpin');
        this._autoSpin = false;
        this.spinTimes.emit("RESET_SPINTIMES");
        if(this._callBackAutoSpin){
            this.unschedule(this._callBackAutoSpin);
            const {isFinished} = this.node.gSlotDataStore.playSession;
            if(isFinished === undefined || isFinished === true){
                this._resetSpinButton();
                this._showTrialButtons(null, true);
                this.node.mainDirector.enableBet();
            }
        }
    },
    onSpacePressed()
    {
        if (!this.node.mainDirector.isDisplayDialog() && !this.node.mainDirector.isDisplayCutscene())
            this.spinClick();
    },
    spinClick() {
        if (!this.node || !this.node.director || !this.node.director.fsm ||
            !this.node.director.fsm.can('actionTrigger') || !this.node.mainDirector.readyToPlay) return;
        this.skipAllEffects();
        this.node.mainDirector.gui.emit("HIDE_INTRO");
        this.table.emit("HIDE_ANIM_INTRO");
        this.runAction('SpinClick');
    },
    fastToResultClick() {
        if (!this.node.active || this.node.opacity == 0) return;
        this.setGameSpeedMode("INSTANTLY");
        this.table.emit("FAST_TO_RESULT");
    },
    multiSpin1Click() {
        this.node.mainDirector && this.node.mainDirector.onIngameEvent("AUTO_SPIN_CLICK");
        this.runAction('SpinByTimes', 10);
        this._autoSpin = true;
    },
    multiSpin2Click() {
        this.node.mainDirector && this.node.mainDirector.onIngameEvent("AUTO_SPIN_CLICK");
        this.runAction('SpinByTimes', 25);
        this._autoSpin = true;
    },
    multiSpin3Click() {
        this.node.mainDirector && this.node.mainDirector.onIngameEvent("AUTO_SPIN_CLICK");
        this.runAction('SpinByTimes', 50);
        this._autoSpin = true;
    },
    multiSpin4Click() {
        this.node.mainDirector.showTrialButtons(false);
        this.node.mainDirector && this.node.mainDirector.onIngameEvent("AUTO_SPIN_CLICK");
        this.runAction('SpinByTimes', 999999);
        this._autoSpin = true;
    },

    forceToExit(script){
        this._super(script);
        this.fsm.actionTrigger();
        this.fsm.resultReceive();
    },

    updateTextWin(isWin)
    {
        if (this.winAmount)
        {
            if (isWin) 
                this.winAmount.getComponent('WinAmount').updateBgToWin();
            else 
                this.winAmount.getComponent('WinAmount').updateBgToLastWin();
        }
    },

    runPromotionSpin() {
        const {promotionBetId, promotionRemain} = this.node.gSlotDataStore;
        this.buttons.emit('SHOW_ALL_PROMOTION_BUTTONS');
        this.spinTimes.emit("UPDATE_SPINTIMES",promotionRemain);
        this.spinTimes.opacity = 0;
        this.isRunPromotion = true;

        // set Bet id with promotionBetId
        this.runAction('SetUpBet', this.getTotalBetValue(promotionBetId));
    },

    _updatePromotionRemain(script, number) {
        this.node.gSlotDataStore.promotionRemain = number;
        this.buttons.emit('PROMOTION_STOP_SPIN_SHOW');
        this.buttons.emit('PROMOTION_SPIN_HIDE');
        this.buttons.emit('HIDE_PROMOTION_SPIN_EFFECT');
        this.executeNextScript(script);
    },

    _resetPromotionButtons(script) {
        this.buttons.emit('PROMOTION_SPIN_SHOW');
        this.buttons.emit('PROMOTION_STOP_SPIN_HIDE');
        this.buttons.emit('SHOW_PROMOTION_SPIN_EFFECT', 2);
        this.executeNextScript(script);
    },

    updatePromotionData(data) {
        const {betId, promotionRemain, promotionTotal} = data;
        this.node.gSlotDataStore.promotion = true;
        this.node.gSlotDataStore.promotionRemain = promotionRemain;
        this.node.gSlotDataStore.promotionBetId = betId;
        this.node.gSlotDataStore.promotionTotal = promotionTotal;
    },

    getTotalBetValue(betId) {
        const { DEFAULT_BET} = this.node.config;
        const {steps} = this.node.gSlotDataStore.slotBetDataStore.data;
        const betValue = String(betId).split('');
        return steps[betValue[0]] || DEFAULT_BET;
    },

    _exitPromotionMode(script) {
        if (this.isRunPromotion) {
            this.isRunPromotion = false;
            this.buttons.emit('HIDE_ALL_PROMOTION_BUTTONS');
            this.spinTimes.emit("RESET_SPINTIMES");
            this.node.gSlotDataStore.promotion = false;
            this.spinTimes.opacity = 255;
            this.executeNextScript(script);
        } else {
            this.executeNextScript(script);
        }
        
    },

    _showPromotionPopup(script) {
        this.node.mainDirector.showPromotionPopup();
        this.executeNextScript(script);
    },

    _showCurrencyErrorPopup(script) {
        this.node.mainDirector.showCurrencyErrorPopup();
        this.executeNextScript(script);
    },

    //Send data to network
    _sendSpinToNetwork(script, {currentBetData}) {
        this.node.mainDirector.sendSpinToNetwork(currentBetData);
        this.node.mainDirector.gui.emit("HIDE_INTRO");
        this.table.emit("HIDE_ANIM_INTRO");
        this.executeNextScript(script);
    },

    //Trigger other mode
    _newGameMode(script, {name, data}) {
        this.resetGameSpeed();
        if (this.node.mainDirector) {
            this.node.mainDirector.newGameMode({name, data}, () =>  {
                this.executeNextScript(script);
            });
        } else {
            cc.error('There is no main Director to new game mode');
            this.executeNextScript(script);
        }
    },
    _resumeGameMode(script, {name, data}) {
        this.resetGameSpeed();
        if(!this.hasTable){
            this.hasTable = true;
        }
        if (this.node.mainDirector) {
            this.node.mainDirector.resumeGameMode({name, data}, () =>  {
                this.executeNextScript(script);
            });
        } else {
            cc.error('There is no main Director to resume game mode');
            this.executeNextScript(script);
        }

        if(!this._autoSpin){
            this.buttons.emit('SPIN_SHOW');
            this.buttons.emit('SPIN_ENABLE');
            this.buttons.emit('FAST_TO_RESULT_HIDE');
            this.buttons.emit('STOP_AUTO_SPIN_HIDE', true);
        }
    },

    //Game flow methods
    _gameStart(script) {
        if (!this.fsm.can('gameStart')) return;
        this.fsm.gameStart();
        this.hasTable = false;
        this.hasPayline = false;
        if ((this.table && this.table.active === true)) {
            this.hasTable = true;
        }
        if ((this.table && this.table.hasPayline === true)) {
            this.hasPayline = true;
        }
        this.executeNextScript(script);
    },
    _gameFinish(script) {
        //Finish will show big win animation
        this.node.mainDirector.onIngameEvent("GAME_RESET_SESSION");
        this.node.gSlotDataStore.timerAFK = 0;
        this.runAction('GameFinish');
        this.executeNextScript(script);
    },
    _gameEnd(script) {
        this.runAction('GameEnd');
        this.executeNextScript(script);
    },
    _gameRestart(script, isSkip = false) {
        if (this.node.gSlotDataStore.currentGameMode == 'normalGame') {
            this.node.mainDirector.onIngameEvent("NORMAL_GAME_RESTART");
        }
        if (!this.fsm.can('gameRestart')) return;
        this.fsm.gameRestart();
        if (!this.node.gSlotDataStore.isAutoSpin) {
            this.buttons.emit('SPIN_SHOW');
            this.buttons.emit('SPIN_ENABLE');
        }
        
        if (!this.isAlwaysAutoSpin) {
            this.buttons.emit('FAST_TO_RESULT_HIDE');
        }
        this.runAction('GameRestart');
        const { GAME_SPEED } = this.node.config;
        const isF2R = GAME_SPEED && this.node.gSlotDataStore.gameSpeed === GAME_SPEED.INSTANTLY;
        if (!isSkip && !isF2R) {
            this.resetGameSpeed();
        }

        this.executeNextScript(script);
    },
    _gameExit(script) {
        if (!this.fsm.can('gameRestart')) return;
        this.fsm.gameRestart();
        this.buttons.emit('SPIN_SHOW');
        this.buttons.emit('SPIN_ENABLE');

        if(this.forceToExitMode){
            this.node.gSlotDataStore.playSession.freeGameRemain = 0;    
            this.node.gSlotDataStore.playSession.bonusGameRemain = 0;
            this.node.gSlotDataStore.lastEvent = {};   
            this.node.gSlotDataStore.isAutoSpin = false;
            this.forceToExitMode = false;  
        }

        //Turn off before swicth mode, because 2 mode use same code, hehe
        if (this.isAlwaysAutoSpin) {
            this.runAction('DisableAutoSpin');
        } else {
            this.buttons.emit('FAST_TO_RESULT_HIDE');
        }

        this.table.emit("GAME_EXIT");

        this.node.exit(() => {
            this.executeNextScript(script);
        });
        this._beginToExit = false;
    },
    

    //Update game settings
    _setTurboMode() {
        if (this.node.gSlotDataStore.modeTurbo) {
            this._setMode('TURBO');
        } else {
            this._setMode('FAST');
        }
    },

    _setMode(mode) {
        this.table.emit("SET_MODE",mode);
    },
    _updateMatrix(script, {matrix, rowOffset}) {
        this.table.emit("CHANGE_MATRIX",{matrix, rowOffset});
        this.executeNextScript(script);
    },
    _resumeSpinTime(script, spinTimes) {
        if(this._autoSpin == true){
            this.node.gSlotDataStore.isAutoSpin = true;
            this.node.gSlotDataStore.spinTimes = spinTimes;
        }
        this.executeNextScript(script);
    },
    _updateSpinTimes(script, spinTimes) {
        this.spinTimes.emit("UPDATE_SPINTIMES",spinTimes);
        this.executeNextScript(script);
    },
    _updateLastWin(script, data) {
        if (data) {
            this.winAmount.emit("CHANGE_TO_LAST_WIN");
        } else {
            this.winAmount.emit("CHANGE_TO_WIN");
        }
        this.executeNextScript(script);
    },
    _updateWinningAmount(script, {winAmount, time}) {
        this.winAmount.emit("UPDATE_WIN_AMOUNT",{value: winAmount, time});
        this.executeNextScript(script);
    },

    //TODO remove it
    _addWinningAmount(script, {winAmount, time}) {
        this.winAmount.emit("UPDATE_WIN_AMOUNT",{value: winAmount, time});
        this.executeNextScript(script);
    },
    //Only when resume
    _updateBet(script, betValue) {
        if (this.node.mainDirector) {
            this.node.mainDirector.updateBet({betId: betValue});
        } else {
            cc.error('There is no main Director to update bet');
        }
        this.executeNextScript(script);
    },

    //NORMAL SPIN FLOW
    _runAutoSpin(script) {
        if (!this.isAlwaysAutoSpin /*normal*/ && this.node.gSlotDataStore.isAutoSpin) {
            this.buttons.emit('STOP_AUTO_SPIN_SHOW');
        }
        this.node.mainDirector.gui.emit("HIDE_INTRO");
        this.table.emit("HIDE_ANIM_INTRO");
        this.skipAllEffects();
        this.buttons.emit('SPIN_DISABLE');
        this._showTrialButtons(null, false);
        this._callBackAutoSpin = () => {
            this.runAction('SpinClick');
            this.executeNextScript(script);
            this._callBackAutoSpin = null;
        };
        this.scheduleOnce(this._callBackAutoSpin, 0.5);
    },
    _spinClick(script) {
        if (!this.fsm.can('actionTrigger')) return;
        this.fsm.actionTrigger();
        this._setTurboMode();
        this.resetGameSpeed();
        this._showTrialButtons(null, false);
        this.buttons.emit('SPIN_DISABLE');
        this.buttons.emit('SPIN_HIDE');
        this.buttons.emit('FAST_TO_RESULT_DISABLE');
        this.buttons.emit('DISABLE_PROMOTION_STOP_SPIN');
        this.buttons.emit('FAST_TO_RESULT_SHOW');

        if (!this.hasTable) {
            this.executeNextScript(script);
            return;
        }
        this.isStopRunning = false;
        this.table.emit("START_SPINNING");
        this.node.mainDirector.onIngameEvent("SPIN_CLICK");
        this.executeNextScript(script);
    },
    _resultReceive(script,data) {
        if (!this.fsm.can('resultReceive')) return;
        this.fsm.resultReceive();
        this.buttons.emit('FAST_TO_RESULT_ENABLE');
        this.buttons.emit('ENABLE_PROMOTION_STOP_SPIN');
        if(this.node.mainDirector.trialMode && this.node.gSlotDataStore.currentGameMode !== "normalGame"){
            this._showTrialButtons(null, true);
        }
        //Check if we have table to show or not.... or should we use base interface????
        //Anyways,... I can decoupling table from game mode, thats good enough for v2
        if (!this.hasTable) {
            this.executeNextScript(script);
            return;
        }
        this.table.emit("STOP_SPINNING",data,() => {
            this.node.mainDirector.onIngameEvent("SPIN_STOPPED");
            this.isStopRunning = true;
            this.executeNextScript(script);
        });
    },
    _showResult(script) {
        const isFTR = this.node.gSlotDataStore.gameSpeed === this.node.config.GAME_SPEED.INSTANTLY;
        if (isFTR) this.node.mainDirector.countingFastToResult();
        this.runAction('ShowResults');
        this.executeNextScript(script);
    },

    _triggerWinEffect(script) {
        this.executeNextScript(script);
    },
    _triggerSmallWinEffect(script) {
        this.executeNextScript(script);
    },

    //PAYLINES
    _setUpPaylines(script, {matrix, payLines}) {
        this.hasPayline = true;
        this.table.emit("SETUP_PAYLINES",matrix, payLines);
        this.executeNextScript(script);
    },
    
    _showNormalSymbolPayLine(script,payLines) {
        if (!this.hasPayline) {
            this.executeNextScript(script);
            return;
        }
        this.table.emit("BLINK_ALL_NORMAL_PAYLINES",() => {
            this.table.emit("SHOW_ALL_NORMAL_PAYLINES",payLines);
            this.executeNextScript(script);
        });
    },
    _showNormalPayline(script)
    {
        if (!this.hasPayline) {
            this.executeNextScript(script);
            return;
        }
        this.table.emit("SHOW_ALL_NORMAL_PAYLINES", ()=>{
            this.executeNextScript(script);
        });
    },
    _showFreePayline(script) {
        if (!this.hasPayline) {
            this.executeNextScript(script);
            return;
        }
        this.table.emit("SHOW_ALL_FREE_PAYLINES", () => {
            this.executeNextScript(script);
        });
    },
    _blinkAllPaylines(script) {
        if (!this.hasPayline) {
            this.executeNextScript(script);
            return;
        }
        this.table.emit("BLINK_ALL_NORMAL_PAYLINES", () => {
            this.executeNextScript(script);
        });
    },
    _blinkAllPaylines_2(script) {
        this.executeNextScript(script);
    },
    _showBonusPayLine(script) {
        if (!this.hasPayline) {
            this.executeNextScript(script);
            return;
        }
        this.table.emit("SHOW_BONUS_PAYLINE",() => {
            this.node.mainDirector.onIngameEvent("ON_FINISH_BONUS_PAYLINE");
            this.executeNextScript(script);
        });
    },
    _showScatterPayLine(script) {
        if (!this.hasPayline) {
            this.executeNextScript(script);
            return;
        }
        this.table.emit("SHOW_SCATTER_PAYLINE",() => {
            this.node.mainDirector.onIngameEvent("ON_FINISH_SCATTER_PAYLINE");
            this.executeNextScript(script);
        });
    },
    _showJackpotPayLine(script) {
        if (!this.hasPayline) {
            this.executeNextScript(script);
            return;
        }
        this.table.emit("SHOW_JACKPOT_PAYLINE",() => {
            this.node.mainDirector.onIngameEvent("ON_FINISH_JACKPOT_PAYLINE");
            this.executeNextScript(script);
        });
    },
    _showWildPayLine(script) {
        if (!this.hasPayline) {
            this.executeNextScript(script);
            return;
        }
        this.table.emit("SHOW_WILD_PAYLINE",() => {
            this.executeNextScript(script);
        });
    },
    _clearPaylines(script) {
        if (!this.hasPayline) {
            this.executeNextScript(script);
            return;
        }
        this.hasPayline = false;
        this.table.emit("CLEAR_PAYLINES");
        this.executeNextScript(script);
    },

    _forceToClearPaylines(script){
        this.table.emit("CLEAR_PAYLINES");
        this.hasPayline = false;
        this.executeNextScript(script);
    },

    _delayTimeScript(script, time) {
        if (this.node.mainDirector.node) {
            this.node.mainDirector.node.runAction(cc.sequence(
                cc.delayTime(time),
                cc.callFunc(() => {
                    this.executeNextScript(script);
                }),
            ));
        } else {
            this.executeNextScript(script);
        }
    },

    _showJackpotCutscene(script,{name,content}){
        if (this.node.mainDirector) {
            this.node.mainDirector.showCutscene(name,content,() => {
                this.executeNextScript(script);
            });
        } else {
            cc.error('There is no main Director to play cutscenes');
            this.executeNextScript(script);
        }
    },

    //Cutscenes
    _showCutscene(script,{name,content}){
        if (this.node.mainDirector) {
            this.node.mainDirector.showCutscene(name,content,() => {
                this.executeNextScript(script);
            });
        } else {
            cc.error('There is no main Director to play cutscenes');
            this.executeNextScript(script);
        }
    },

    _showCutscene_2(script){
        this.executeNextScript(script);
    },

    _showUnskippedCutscene(script, {name,content}){
        if (this.node.mainDirector) {
            this.node.mainDirector.showCutscene(name,content,() => {
                this.executeNextScript(script);
            });
        } else {
            cc.error('There is no main Director to play cutscenes');
            this.executeNextScript(script);
        }
    },

    _hideCutscene(script, {name}){
        if (this.node.mainDirector) {
            this.node.mainDirector.cutscene.emit("CLOSE_CUTSCENE", name);
        } else {
            cc.error('There is no main Director to play cutscenes');
        }
    },

    _openInfo(script,{name,content}){
        if (this.node.mainDirector) {
            this.node.mainDirector.showCutscene(name,content,() => {
                this.executeNextScript(script);
            });
        } else {
            cc.error('There is no main Director to play cutscenes');
            this.executeNextScript(script);
        }
    },

    _openInfo_2(script,{name,content}){
        if (this.node.mainDirector) {
            let _content = Object.assign({}, content);
            _content.instantly = true;
            this.node.mainDirector.showCutscene(name,_content,() => {
                this.executeNextScript(script);
            });
        } else {
            cc.error('There is no main Director to play cutscenes');
            this.executeNextScript(script);
        }
    },

    _clearWinAmount(script) {
        this.winAmount.emit("RESET_NUMBER");
        this.executeNextScript(script);
    },

    update() {
        if (!this.node.mainDirector || !this.node.mainDirector.gameStateManager) return;

        const wallet = this.node.mainDirector.gameStateManager.getCurrentWallet();
        if (!lodash.isNumber(wallet) || lodash.isNaN(wallet)) return;

        if (this.node.director.fsm.can('actionTrigger')) {
            this.runAction('UpdateWalletData', wallet);
        }
    },

    _updateWallet(script) {
        if (this.node.mainDirector) {
            this.node.mainDirector.updateWallet();  
            this.executeNextScript(script);
        } else {
            cc.error('There is no main Director to play cutscenes');
            this.executeNextScript(script);
        }
    },

    _updateWalletOnTrialSpinClick(script) {
        if (this.node.mainDirector) {
            this.node.mainDirector.updateWalletOnTrialSpinClick();
            this.executeNextScript(script);
        } else {
            cc.error('There is no main Director to play cutscenes');
            this.executeNextScript(script);
        }
    },

    _updateTrialWallet(script, data) {
        if (this.node.mainDirector) {
            this.node.mainDirector.updateTrialWallet(data);
            this.executeNextScript(script);
        } else {
            cc.error('There is no main Director to play cutscenes');
            this.executeNextScript(script);
        }
    },

    _showTrialButtons(script, isOn) {
        let isAutoSpin = this.node.gSlotDataStore.isAutoSpin;
        let isNormalGame = this.node.gSlotDataStore.currentGameMode === "normalGame";
        if (this.node.mainDirector) {
            const { trialMode } = this.node.mainDirector;
            if (trialMode && !isNormalGame && !this.forceToExitMode) {
                this.node.mainDirector.showTrialButtons(isOn);
            } else {
                const turnOn = isOn && !isAutoSpin && this.isStopRunning;
                this.node.mainDirector.showTrialButtons(turnOn);
            }
        }
        if (this.node.mainDirector.trialMode && this.node.config.CAN_BACK_TO_REAL_MODE) {
            this.node.mainDirector.showTrialButtons(true);
        }
        this.executeNextScript(script);
    },

    _showMessageNoMoney(script, data)
    {
        if (this.node.mainDirector.isUserLogout()) return;
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGIN_IFRAME} = loadConfigAsync.getConfig();
        const {MESSAGE_DIALOG: {NO_MONEY, DEPOSIT_MONEY}} = this.node.config;

        let message = {
            name: "DialogMessage",
        };

        if (LOGIN_IFRAME && typeof(ingameDeposit) === 'function')
        {
            message.content = {strText: DEPOSIT_MONEY, actionBtnOK: ()=>{ingameDeposit();}, actionCancel: ()=>{}};
            cc.log("Show Deposit");
        }
        else
        {
            message.content = {strText: NO_MONEY, actionBtnOK: () => {data && data.callback && data.callback();}};
            cc.log("Show No Money");
        }
        this._showCutscene(script, message);
    },

    _resetSpinButton(script){
        this.buttons.emit('SPIN_SHOW');
        this.buttons.emit('SPIN_ENABLE');
        this.buttons.emit('STOP_AUTO_SPIN_HIDE');
        this.buttons.emit('FAST_TO_RESULT_HIDE');
        const {promotion} = this.node.gSlotDataStore;
        if (!promotion) {
            this.spinTimes.emit("RESET_SPINTIMES");
        }
        this._autoSpin = false;
        this.executeNextScript(script);
    },
    
    disableSpin()
    {
        this.buttons.emit("SPIN_DISABLE");
    },

    enableSpin()
    {
        this.buttons.emit("SPIN_ENABLE");
    },

    runContinueScript() {
        const {data, script} = this.storeNextScripts;
        this[this.storeCurrentScripts] && this[this.storeCurrentScripts](script, data);
        this._resetStoreScript();
    },

    _resetStoreScript() {
        this.storeCurrentScripts = '';
        this.storeNextScripts = {
            script: [],
            data: {}
        };
    },

    _checkPauseTutorial(flag) {
        const {mainDirector} = this.node;
        return mainDirector && mainDirector.checkPauseTutorial(flag);
    },

    checkAutoSpinFlag(flag) {
        const isPauseAutoSpin = this._checkPauseTutorial(flag);
        this.buttons.emit('PAUSE_AUTO_SPIN', isPauseAutoSpin);
    },

    _pauseUpdateJP(script){
        this.node.mainDirector.pauseJackpot();
        this.executeNextScript(script);
    },
    _resumeUpdateJP(script){
        this.node.mainDirector.resumeJackpot();
        this.executeNextScript(script);
    },
    _disableBet(script) {
        this.node.mainDirector.disableBet();
        this.executeNextScript(script);
    },
    _enableBet(script) {
        this.node.mainDirector.enableBet();
        this.executeNextScript(script);
    },

    _stopAutoSpin(script) {
        this.stopAutoSpinClick();
        this.executeNextScript(script);
    },

    _enableSkipTutorial(script, isOn) {
        if (this.node.mainDirector.isTutorialShowing()) {
            this.node.mainDirector.tutorialMgr.enableSkipBtn(isOn);
        }
        this.executeNextScript(script);
    },

    _sendFreeSpinToNetwork(script) {
        this.node.mainDirector.gameStateManager.triggerFreeSpinRequest();
        this.executeNextScript(script);
    },

    freeSpinOptionTrigger(optionIndex){
        if(this.node.mainDirector){
            this.node.mainDirector.gameStateManager.triggerFreeSpinOption(optionIndex);
            this.fsm.gameRestart();
            this.hasTable = false;
            this.fsm.actionTrigger();
        }
    },

    skipAllEffects(){
        if (this.node.mainDirector) {
            this.node.mainDirector.cutscene.emit("SKIP_CUTSCENES");
        } else {
            cc.error('There is no main Director to skip cutscenes');
        }
    },

    _updateWinningAmountSync(script, {winAmount, time, rate, isSessionEnded}){
        const {isAutoSpin, gameSpeed} = this.node.gSlotDataStore;
        const isFTR = gameSpeed === this.node.config.GAME_SPEED.INSTANTLY;
        const timeShow = isFTR ? 20 : time;
        this._canFastUpdateWinAmount = true;
        this._winValue = winAmount;
        let runScript = false;
        if (!isFTR) {
            this.playSoundWin(rate);
        }
        this.winAmount.emit("UPDATE_WIN_AMOUNT",{value: winAmount, time: timeShow}, ()=>{
            this._canFastUpdateWinAmount = false;
            this._winValue = 0;
            this.stopSoundWin();
            (!isSessionEnded || !runScript) && this.executeNextScript(script);
        });
        if (isSessionEnded && !isAutoSpin) {
            runScript = true;
            this.executeNextScript(script);
        }
    },

    playSoundWin(){
        /**@override to play sound */
        // if (this.node.soundPlayer) this.node.soundPlayer.playSoundWinLine(rate);
    },

    stopSoundWin(){
        /**@override to stop sound */
        // if (this.node.soundPlayer) this.node.soundPlayer.stopSoundWinLine();
    },

    _showAnimIntro(script){
        this.showAnimIntro();
        this.executeNextScript(script);
    },

    _hideAnimIntro(script){
        this.hideAnimIntro();
        this.executeNextScript(script);
    },

    showAnimIntro(){
        this.table.emit("SHOW_ANIM_INTRO");
    },

    hideAnimIntro(){
        this.node.mainDirector.gui.emit("HIDE_INTRO");
        this.table.emit("HIDE_ANIM_INTRO");
    },


    // handle back to real mode or force reset game mode
    forceResetGameMode(gameMode) {
        this.isSkipAllScrips = true;
        
        this.forceStopAutoSpining();
        this.forceResetTable();

        if (gameMode === 'bonusGame') {
            this.forceResetBonusGame();
        }
        if (gameMode === 'freeGame') {
            this.forceResetFreeGame();
        }
        if (gameMode === 'normalGame') {
            this.forceResetNormalGame();
        }
        this.forceResetExtend();
        this.forceResetEffect();
    },

    forceStopAutoSpining() {
        if (this.buttons) this.buttons.emit('STOP_AUTO_SPIN_HIDE');
        if (this.spinTimes) this.spinTimes.emit("RESET_SPINTIMES");
        this._autoSpin = false;
        if (this._callBackAutoSpin) {
            this.unschedule(this._callBackAutoSpin);
        }
    },

    forceResetTable() {
        if (!this.table) return;
        if (!this.isStopRunning) {
            this.table.emit('STOP_REEL_WITH_RANDOM_MATRIX', () => {
                this.isStopRunning = true;
            });
        }
        this.table.emit('FORCE_RESET_TABLE_EFFECT');
        this.fsm.resultReceive();
        this.fastToResultClick();
    },

    forceResetNormalGame() {
        this.scheduleOnce(() => {
            this.fsm.reboot();
            this.fsm.gameStart();
            this.isSkipAllScrips = false;
            this._resetSpinButton();
            this._showTrialButtons(null, true);
            this.node.mainDirector.enableBet();
        }, 1);
    },

    forceResetFreeGame() {
        this.node.resetCallbackWhenHide();
        this.scheduleOnce(() => {
            this.isSkipAllScrips = false;
            this.table.emit("GAME_EXIT");
            this.fsm.reboot();
            this.fsm.gameStart();
            this.node.exit(() => {});
        }, 1);
    },

    forceResetBonusGame() {
        this.node.resetCallbackWhenHide();
        this.scheduleOnce(() => {
            this.fsm.reboot();
            this.fsm.gameStart();
            this.isSkipAllScrips = false;
            this.node.exit(() => {});
        }, 1);
    },

    forceResetExtend() {
        // reset topup, gamble, etc...
    },

    forceResetEffect() {
        // override it to stop action, tween, schedule or cutscenes
    },
});
