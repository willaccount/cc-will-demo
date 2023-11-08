

const {formatMoney, formatWalletMoney, findKeyByValue, convertObjectToArrayKey, convertObjectToArray} = require('utils');
const {getBetValueWithGame, setBetValueWithGame} = require('gameCommonUtils');

cc.Class({
    extends: cc.Component,
    properties: {
        bg: cc.Node,
        bgBetNormal: {
            default: null,
            type: cc.SpriteFrame,
        },
        bgBetMin: {
            default: null,
            type: cc.SpriteFrame,
        },
        bgBetMax: {
            default: null,
            type: cc.SpriteFrame,
        },
        betSFX: {
            default: null,
            type: cc.AudioClip,
        },
        decreaseSFX: {
            default: null,
            type: cc.AudioClip,
        },
        increaseSFX: {
            default: null,
            type: cc.AudioClip,
        },
        betDenomLabel: cc.Node,
        isCircular: true,
        increaseButton: cc.Button,
        decreaseButton: cc.Button,
    },

    onLoad() {
        this.node.on("UPDATE_BET", this.updateBet, this);
        this.node.on("LOAD_BET", this.loadBet, this);
        this.node.on('ENABLE_BET', this.enableBetBtn, this);
        this.node.on('DISABLE_BET', this.disableBetBtn, this);
        this.node.on('UPDATE_BET_VALUE', this.updateBetValue, this);
        this.node.on('SWITCH_MODE', (isTrial)=>{
            this.trialMode = isTrial;
        });
        this.increaseBetEvent = new cc.Event.EventCustom("INGAME_EVENT_RAISED", true);
        this.increaseBetEvent.setUserData({trigger:"BET_INCREASE"});
    },
    checkColorChange() {
        const {currentBetData, steps} = this.node.gSlotDataStore.slotBetDataStore.data;
        let minBet = 0;
        let maxBet = 0;
        if(Array.isArray(steps)){
            minBet = steps[0];
            maxBet = steps[steps.length - 1];
        }else{
            const newSteps = convertObjectToArray(steps);
            minBet = newSteps[0]; 
            maxBet = newSteps[newSteps.length - 1];
        }
        if (this.bg) {
            if (currentBetData === minBet) {
                this.bg.getComponent(cc.Sprite).spriteFrame = this.bgBetMin;
            } else if (currentBetData === maxBet) {
                this.bg.getComponent(cc.Sprite).spriteFrame = this.bgBetMax;
            } else {
                this.bg.getComponent(cc.Sprite).spriteFrame = this.bgBetNormal;
            }
        }
    },

    loadBet({gameId}) {
        const {steps, currentBetData} = this.node.gSlotDataStore.slotBetDataStore.data;
        if (gameId) {
            this.gameId = gameId;
        }
        let defaultBet = getBetValueWithGame(gameId, steps) || currentBetData;

        this.updateBet(defaultBet);
    },

    updateBet(betId) {
        const {steps} = this.node.gSlotDataStore.slotBetDataStore.data;
        if (!findKeyByValue(steps, betId)) {
            return;
        }
        if (!this.trialMode)
            setBetValueWithGame(this.gameId, betId);
        this.node.gSlotDataStore.slotBetDataStore.updateCurrentBet(betId);
        this.updateBetValue(betId);
        this.checkColorChange();
        this.node.emit('BET_CHANGE', betId);

        // if (!this.isCircular) this.checkDisableButtons(currentBetData, maxBet, minBet);
    },
    reduceBet() {
        const {currentBetData, steps} = this.node.gSlotDataStore.slotBetDataStore.data;
        let stepIndex = findKeyByValue(steps, currentBetData);
        if (!stepIndex) {
            return;
        }
        const arrayBetIndex = convertObjectToArrayKey(steps);
        const minBet = steps[arrayBetIndex[0]];
        const maxBet = steps[arrayBetIndex[arrayBetIndex.length - 1]];
        let newBet = maxBet;
        if (currentBetData > minBet) {
            newBet = steps[arrayBetIndex[arrayBetIndex.indexOf(stepIndex) - 1]];
        }
        this.updateBet(newBet);

        // if (!this.isCircular) this.checkDisableButtons(newBet, maxBet, minBet);
        if (this.node.soundPlayer) this.node.soundPlayer.playSFX(this.decreaseSFX || this.betSFX);
    },
    increaseBet() {
        const {currentBetData, steps} = this.node.gSlotDataStore.slotBetDataStore.data;
        let stepIndex = findKeyByValue(steps, currentBetData);
        if (!stepIndex) {
            return;
        }
        const arrayBetIndex = convertObjectToArrayKey(steps);
        const minBet = steps[arrayBetIndex[0]];
        const maxBet = steps[arrayBetIndex[arrayBetIndex.length - 1]];
        let newBet = minBet;
        if (currentBetData < maxBet) {
            newBet = steps[arrayBetIndex[arrayBetIndex.indexOf(stepIndex) + 1]];
        }
        this.updateBet(newBet);
        // if (!this.isCircular) this.checkDisableButtons(newBet, maxBet, minBet);
        if (this.node.soundPlayer) this.node.soundPlayer.playSFX(this.increaseSFX || this.betSFX);
        this.increaseBetEvent.unuse();
        this.increaseBetEvent.reuse("INGAME_EVENT_RAISED", true);
        this.node.dispatchEvent(this.increaseBetEvent);
    },

    disableBetBtn() {
        if (this.increaseButton) {
            this.increaseButton.interactable = false;
        }
        if (this.decreaseButton) {
            this.decreaseButton.interactable = false;
        }
    },

    enableBetBtn() {
        if (this.increaseButton) {
            this.increaseButton.interactable = true;
        }
        if (this.decreaseButton) {
            this.decreaseButton.interactable = true;
        }
    },

    checkDisableButtons(current, max, min) {
        this.increaseButton.interactable = true;
        this.decreaseButton.interactable = true;

        if (current == max)
            this.increaseButton.interactable = false;

        if (current == min)
            this.decreaseButton.interactable = false;
    },

    updateBetValue(value) {
        if (this.betDenomLabel && this.node.config) {
            const {PAY_LINE_LENGTH} = this.node.config;
            this.betDenomLabel.getComponent(cc.Label).string = `${formatWalletMoney(Number(value) / Number(PAY_LINE_LENGTH))}`;
            this.node.emit("UPDATE_STRING", {value: formatWalletMoney(value)});
        } else {
            this.node.emit("UPDATE_STRING", {value: formatMoney(value)});
        }
    }
});
