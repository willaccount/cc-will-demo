const { formatMoney } = require("utils");
const lodash = require('lodash');
cc.Class({
    extends: require("WinAmount"),

    properties: {
        labelWinAmount: cc.Label,
        _currentValue: 0,
        currentValue: {
            get(){
                return this._currentValue;
            },
            set(value){
                if(this._currentValue !== value){
                    this._currentValue = value;
                    this._updateLabelWinAmount();
                }
            },
            visible: false
        }
    },

    onLoad() {
        this._super();
        this.node.on("FAST_UPDATE_WIN_AMOUNT", this.fastUpdateWinAmount, this);
        this.node.on("RESET_NUMBER", this.clearWinAmount, this);
        this.node.on("FADE_OUT_NUMBER", this.fadeOutNumber, this);
        this.node.getCurrentWinValue = this.getCurrentWinValue.bind(this);
        this.gameDirector = this.node.mainDirector ? this.node.mainDirector.director : null;
    },
    
    getCurrentWinValue(){
        return this._winValue;
    },

    updateWinAmount({value, time, isLastest}, callback) {
        if(isLastest && this.node.gSlotDataStore) {
            value = this.node.gSlotDataStore.playSession.winAmount;
        }
        if(value < this._currentValue || value < this._winValue) {
            cc.log("Logic fail somewhere, script clear winamount have not ran yet", {current: this._currentValue, endValue:this._winValue, fastUpdateValue:value});
            this.clearWinAmount();
        }
        this._callBackOnComplete = callback;
        this._winValue = value;
        time = this._currentValue  === value ? 0 : time;
        this._tweenWinAmount(value,time);
        cc.log("run updateWinAmount", {value, time, isLastest});
    },

    fastUpdateWinAmount({value, time}){
        if(!value) value = this._winValue;
        if(value < this._currentValue || value < this._winValue) {
            cc.error("Logic fail: Could not speed up to the smaller value", {current: this._currentValue, endValue:this._winValue, fastUpdateValue:value});
            return;
        }

        this._tweenWinAmount(value,time);
        cc.log("run fastUpdateWinAmount", {value, time});
    },

    _tweenWinAmount(value, time){
        this._resetLabel();
        if(time === 0) {
            this._tweenValue && this._tweenValue.stop();
            this._tweenValue = null;
            this.currentValue = value;
            this._callBackOnComplete  && this._callBackOnComplete();
            this._callBackOnComplete = null;
            this._updateWallet();
            cc.log("show win Amount instantly", {value, time});
            return;
        }

        this._tweenValue && this._tweenValue.stop();
        if(this.node.gSlotDataStore){
            this.node.gSlotDataStore.isUpdateWinAmount = true;
        }
        this._tweenValue = cc.tween(this)
            .to(time/1000, {currentValue: value}, {easing: 'sineInOut'})
            .call(()=>{
                this._updateWallet();
                this._callBackOnComplete && this._callBackOnComplete();
                this._callBackOnComplete = null;
                this._tweenValue = null;
            });
        this._tweenValue.start();
        cc.log("_tweenWinAmount", {value, time});
    },

    clearWinAmount(){
        this._resetLabel();
        this.currentValue = 0;
        this._winValue = 0;
    },

    _updateLabelWinAmount(){
        this.labelWinAmount.string = this.currentValue > 0 ? formatMoney(this._currentValue) : "";
    },

    _updateWallet(){
        if(this.node.gSlotDataStore){
            this.node.gSlotDataStore.isUpdateWinAmount = false;
        }
        if(this.gameDirector) {
            const wallet = this.gameDirector.gameStateManager.getCurrentWallet();
            if(wallet && lodash.isNumber(wallet) && !lodash.isNaN(wallet)){
                this.node.gSlotDataStore.slotBetDataStore.updateWallet(wallet);
            }
            if(this.gameDirector.trialMode){
                this.gameDirector.updateTrialWallet();
            }else{
                this.gameDirector.updateWallet();
            }
        }
    },

    fadeOutNumber(time = 1) {
        if (!this.labelWinAmount) return;
        this.node.isFading = true;
        if( this._tweenValue){
            this._tweenValue.stop();
            this._tweenValue = null;
            this.currentValue = this._winValue;
        }
        if(this._callBackOnComplete){
            this._callBackOnComplete();
            this._callBackOnComplete = null;
        }
        if(this.node.gSlotDataStore){
            this.node.gSlotDataStore.isUpdateWinAmount = false;
        }
        this.labelWinAmount.node.stopAllActions();
        this.labelWinAmount.node.runAction(cc.sequence(
            cc.fadeOut(time),
            cc.callFunc(() => {
                this.node.isFading = false;
                this.clearWinAmount();
            })
        ));
    },

    _resetLabel() {
        this.labelWinAmount.node.stopAllActions();
        this.labelWinAmount.node.opacity = 255;
        this.node.isFading = false;
    },

    onDestroy() {
        this._tweenValue && this._tweenValue.stop();
    }
});
