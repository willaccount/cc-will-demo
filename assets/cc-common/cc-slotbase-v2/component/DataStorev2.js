

const BetDataStore = require('MoneyDataStore');
const {convertSlotMatrixTBLR, convertPayLine, convertPayLineAllways} = require('utils');

cc.Class({
    extends: cc.Component,
    properties: {
        isEnableBGM: false,
        isEnableSFX: true
    },
    onLoad() {
        this.node.gSlotDataStore = {
            slotBetDataStore: new BetDataStore(),
            playSession: {},
            lastEvent: {},
            lastedNormalPaylines: {},
            modeTurbo: false,
            isAutoSpin: false,
            spinTimes: 0,
            gameId: "9984",
            isEnableBGM: false,
            isEnableSFX: false,
            betValueWithGame: [...Array(this.node.config.PAY_LINE_LENGTH).keys()].map(i => i + 1) // Store selected paylines
        };
        this.node.gSlotDataStore.gameId = this.gameId;
        this.node.gSlotDataStore.isEnableBGM = this.isEnableBGM;
        this.node.gSlotDataStore.isEnableSFX = this.isEnableSFX;
        this.node.gSlotDataStore.slotBetDataStore.createDefaultBet(this.node.config);

        this.node.gSlotDataStore.formatData = this.formatData.bind(this);
        this.node.gSlotDataStore.convertSlotMatrix = convertSlotMatrixTBLR.bind(this);

        if (this.node.config.PAY_LINE_ALLWAYS)
        {
            this.node.gSlotDataStore.convertPayLine = convertPayLineAllways.bind(this);
        }
        else
        {
            this.node.gSlotDataStore.convertPayLine = convertPayLine.bind(this);
        }
    },
    formatData(playSession) {
        const {TABLE_FORMAT} = this.node.config;
        this.node.gSlotDataStore.playSession = playSession;
        let lastEvent;

        const {normalGameResult, freeGameResult, bonusGameResult, freeSpinOptionResult} = playSession.lastEvent;
        const {bonusGameRemain, extend, bonusGameMatrix} = playSession;
        let tableFormat = TABLE_FORMAT;

        if (bonusGameResult) {
            lastEvent = bonusGameResult;
            lastEvent.type = "bonusGame";
        } 
        else if (freeSpinOptionResult) {
            lastEvent = freeSpinOptionResult;
            lastEvent.type = "freeGameOptionResult";
        }
        else if (freeGameResult) {
            lastEvent = freeGameResult;
            lastEvent.type = "freeGame";

            const {freeGameTableFormat} = this.node.gSlotDataStore.playSession;
            if (freeGameTableFormat)
                tableFormat = freeGameTableFormat;
        } else {
            lastEvent = normalGameResult;
            lastEvent.type = "normalGame";

            const {normalGameTableFormat} = this.node.gSlotDataStore.playSession;
            if (normalGameTableFormat)
                tableFormat = normalGameTableFormat;
        }

        lastEvent = this._mapNewKeys(lastEvent);

        if (lastEvent.matrix) {
            lastEvent.matrix = this.node.gSlotDataStore.convertSlotMatrix(lastEvent.matrix, tableFormat);
        }

        if (lastEvent.payLines) {
            lastEvent.payLines = this.node.gSlotDataStore.convertPayLine(lastEvent.payLines);
        }

        this.node.gSlotDataStore.playSession.currentBonusCredits = 0;
        if (bonusGameRemain > 0 && bonusGameRemain != extend.cfPlayBonus && bonusGameMatrix)
        {
            this.node.gSlotDataStore.playSession.bonusGameMatrix.forEach(it => {
                if (it > 0) this.node.gSlotDataStore.playSession.currentBonusCredits += it;
            });
        }

        this.node.gSlotDataStore.lastEvent = lastEvent;
        cc.warn("%c data-update ", "color: red", this.node.gSlotDataStore.playSession);
        return lastEvent;
    },

    _mapNewKeys(lastEvent) {
        const mapKeys = {
            pLines: 'payLines',
            bg: 'bonusGame',
            fg: 'freeGame',
            wAmt: 'winAmount',
            jpInfo: 'jackpotJnfo'
        };

        Object.keys(lastEvent).forEach(key => {
            if (mapKeys[key]) {
                const newKey = mapKeys[key];
                lastEvent[newKey] = lastEvent[key];
            }
        });

        return lastEvent;
    },
});
