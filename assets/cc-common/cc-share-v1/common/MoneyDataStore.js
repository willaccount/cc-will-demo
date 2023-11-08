

const { convertObjectToArray, formatMoney, subtractDecimals, getUtilConfig, floatUtils } = require('utils');

cc.Class({
    createDefaultBet(slotConfig, dynamicBet) {
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGIN_IFRAME} = loadConfigAsync.getConfig();
        const {STEPS, DEFAULT_BET, EXTRA_BET_STEPS, DEFAULT_EXTRA_BET, DEFAULT_BET_IFRAME, STEPS_IFRAME} = slotConfig;
        let dataDefault = {};
        if (dynamicBet) {
            dataDefault = {
                currentBetData: convertObjectToArray(dynamicBet)[0],
                steps: dynamicBet,
                currentExtraBetData: DEFAULT_EXTRA_BET ? DEFAULT_EXTRA_BET : 0,
                extraSteps: EXTRA_BET_STEPS,
            };
        } else if (LOGIN_IFRAME && DEFAULT_BET_IFRAME && STEPS_IFRAME) {
            dataDefault = {
                currentBetData: DEFAULT_BET_IFRAME,
                steps: STEPS_IFRAME,
                currentExtraBetData: DEFAULT_EXTRA_BET ? DEFAULT_EXTRA_BET : 0,
                extraSteps: EXTRA_BET_STEPS,
            };
        } else {
            dataDefault = {
                currentBetData: DEFAULT_BET,
                steps: STEPS,
                currentExtraBetData: DEFAULT_EXTRA_BET ? DEFAULT_EXTRA_BET : 0,
                extraSteps: EXTRA_BET_STEPS,
            };
        }
        this.data = Object.assign({}, dataDefault);
        return this.data;
    },
    updateCurrentBet(value) {
        this.data.currentBetData = value;
    },
    updateCurrentExtraBet(value) {
        this.data.currentExtraBetData = value;
    },
    updateWallet(value) {
        if (!floatUtils.isEqual(value, this.data.wallet)) {
            const diff = floatUtils.minus(value, this.data.wallet);
            const sign = diff > 0 ? "+" : "";
            cc.log("%cWallet change: ", "color:red;", this.data.wallet, sign, diff, "=", value);
        }
        this.data.wallet = value;
    },
    calculateWalletAfterClickSpin(totalBetData) {
        let { wallet, currentBetData } = this.data;
        return floatUtils.minus(wallet, totalBetData || currentBetData);
    },
    updateWalletAfterClickSpin(totalBetData) {
        let { wallet, currentBetData } = this.data;
        if (wallet >= currentBetData) {
            this.data.wallet = floatUtils.minus(wallet, totalBetData || currentBetData)
            cc.log("%cWallet change on Spin:", "color:red;", wallet, " - " + currentBetData + " =", this.data.wallet);
            return this.data.wallet;
        }
        return wallet;
    },
});
