const { formatMoney, findKeyByValue, convertObjectToArrayKey } = require('utils');
cc.Class({
    extends: cc.Component,

    properties: {
        gameId: 9948,
        btnConfirm: cc.Node,
        btnClose: cc.Node,
        btnMaxBet: cc.Node,
        betOption: cc.Node,
        lblWinAmount: cc.Node,
        lblWallet: cc.Node,
        lblCurrentBet: cc.Node,
        lblMax: cc.Node,
        colorSelectedConfirm: cc.Color,
        colorSelectedMaxBet: cc.Color,
        colorUnSelected: cc.Color,
        selectedValue: -1,
    },

    onLoad() {
        this.node.on('UPDATE_VALUE', this.updateValue, this);
        this.node.on('CLEAR_ALL_BET', this.clearAllBets, this);
    },

    start() {
        // const list = [1000, 5000, 10000, 20000, 50000, 100000, 200000];
        // list.sort((a, b) => { return b - a; });
        // this.betOption.emit('UPDATE_DATA', list, 5000, this);
    },

    updateValue() {
        const { currentBetData, steps } = this.node.gSlotDataStore.slotBetDataStore.data;
        let stepIndex = findKeyByValue(steps, currentBetData);
        if (!stepIndex) {
            return;
        }
        const betValues = Object.values(steps);
        betValues.sort((a, b) => { return b - a; });
        this.betOption.emit('UPDATE_DATA', betValues, currentBetData, this);
        const isMaxBet = betValues[0] == currentBetData;
        this.btnMaxBet.getComponent(cc.Button).interactable = !isMaxBet;
        this.unSetSelectColorButtons(isMaxBet);
        this.updateBottomLabelValue();
    },

    updateBottomLabelValue() {
        const { currentBetData, wallet } = this.node.gSlotDataStore.slotBetDataStore.data;
        const {winAmountPS } = this.node.gSlotDataStore.playSession;
        
        this.lblWinAmount && (this.lblWinAmount.getComponent(cc.Label).string = formatMoney(winAmountPS));

        this.lblCurrentBet && (this.lblCurrentBet.getComponent(cc.Label).string = formatMoney(currentBetData));

        if (!this.node.gSlotDataStore.isTrialMode) {
            this.lblWallet && (this.lblWallet.getComponent(cc.Label).string = formatMoney(wallet));
        } else {
            this.lblWallet && (this.lblWallet.getComponent(cc.Label).string = formatMoney(this.node.mainDirector.director.trialWalletAmount.controller.lastValue));
        }
    },


    setSelectedBet(value, isMaxBet = false) {
        // console.warn('hhh setSelectedBet ' + value + ' isMaxBet ' + isMaxBet);
        this.selectedBet = value;
        this.btnMaxBet.getComponent(cc.Button).interactable = !isMaxBet;
    },

    setSelectColorButtons() {
        this.btnMaxBet.getComponent(cc.Button).target.color = this.colorSelectedMaxBet;
        this.btnConfirm.getComponent(cc.Button).target.color = this.colorSelectedConfirm;
        this.btnClose.getComponent(cc.Button).target.color = this.colorSelectedConfirm;
        this.lblMax.color = this.colorSelectedMaxBet;
    },

    unSetSelectColorButtons(isMaxBet = false) {
        if (!isMaxBet) {
            this.btnMaxBet.getComponent(cc.Button).target.color = this.colorUnSelected;
            this.lblMax.color = this.colorUnSelected;
        }
        else {
            this.btnMaxBet.getComponent(cc.Button).target.color = this.colorSelectedMaxBet;
            this.lblMax.color = this.colorSelectedMaxBet;
        }

        this.btnConfirm.getComponent(cc.Button).target.color = this.colorUnSelected;
        this.btnClose.getComponent(cc.Button).target.color = this.colorUnSelected;
    },

    clickBtnConfirm() {
        // this.node.emit('HIDE');
        this.selectBetEvent = new cc.Event.EventCustom('SELECT_BET_EVENT', true);
        this.selectBetEvent.setUserData({
            betValue: this.selectedBet,
        });
        this.node.dispatchEvent(this.selectBetEvent);
    },

    onClickSelectBet(evt, id) {
        const { currentBetData, steps } = this.node.gSlotDataStore.slotBetDataStore.data;
        let stepIndex = findKeyByValue(steps, currentBetData);
        if (!stepIndex) return;

        id--;
        const arrayBetIndex = convertObjectToArrayKey(steps);
        this.selectedBet = steps[arrayBetIndex[id]];
        if (this.selectedBet === steps[arrayBetIndex[arrayBetIndex.length - 1]]) {
            this.btnMaxBet.getComponent(cc.Button).interactable = false;
        } else this.btnMaxBet.getComponent(cc.Button).interactable = true;
    },

    onClickMaxBet() {
        this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
        this.betOption.emit('SELECT_MAX_BET');
    },

    clickBtnClose(){
        this.node.soundPlayer && this.node.soundPlayer.playSFXClick();
        this.node.parent.emit("HIDE");
    },

    clearAllBets() {
        this.betOption.emit('CLEAR_ALL_BET');
    }
});
