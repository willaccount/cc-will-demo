

const BetDataStore = require('MoneyDataStore');
const {convertSlotMatrixTBLR, convertPayLine} = require('utils');

cc.Class({
    extends: cc.Component,
    properties: {
        isEnableBGM: false,
        isEnableSFX: true,
    },
    onLoad() {
        this.node.gSlotDataStore = {
            slotBetDataStore: new BetDataStore(),
            playSession: {},
            lastEvent: {},
            modeTurbo: false,
            isAutoSpin: false,
            spinTimes: 0,
            gameId: "9000",
            isEnableBGM: false,
            isEnableSFX: false,
        };
        this.node.gSlotDataStore.gameId = this.gameId;
        this.node.gSlotDataStore.isEnableBGM = this.isEnableBGM;
        this.node.gSlotDataStore.isEnableSFX = this.isEnableSFX;
        this.node.gSlotDataStore.slotBetDataStore.createDefaultBet(this.node.config);

        this.node.gSlotDataStore.formatData = this.formatData.bind(this);
        this.node.gSlotDataStore.convertSlotMatrix = convertSlotMatrixTBLR.bind(this);
        this.node.gSlotDataStore.convertPayLine = convertPayLine.bind(this);
    },
    formatData(playSession) {
        const {TABLE_FORMAT} = this.node.config;
        this.node.gSlotDataStore.playSession = playSession;
        let lastEvent;
        
        const {normalGameResult, freeGameResult, bonusGameResult} = playSession.lastEvent;
        let tableFormat = TABLE_FORMAT;
        if (bonusGameResult) {
            lastEvent = bonusGameResult;
            lastEvent.type = "bonusGame";
        } else if (freeGameResult) {
            lastEvent = freeGameResult;
            lastEvent.type = "freeGame";

            const {freeGameTableFormat} = this.node.gSlotDataStore.playSession;
            if (freeGameTableFormat) tableFormat = freeGameTableFormat;
        } else {
            lastEvent = normalGameResult;
            lastEvent.type = "normalGame";

            const {normalGameTableFormat} = this.node.gSlotDataStore.playSession;
            if (normalGameTableFormat) tableFormat = normalGameTableFormat;
        }

        if (lastEvent.matrix) {
            lastEvent.matrix = this.node.gSlotDataStore.convertSlotMatrix(lastEvent.matrix,tableFormat);
        }
        if (lastEvent.matrixTransform0) {
            lastEvent.matrixTransform0 = this.node.gSlotDataStore.convertSlotMatrix(lastEvent.matrixTransform0,tableFormat);
        }
        if (lastEvent.matrixTransform1) {
            lastEvent.matrixTransform1 = this.node.gSlotDataStore.convertSlotMatrix(lastEvent.matrixTransform1,tableFormat);
        }
        if (lastEvent.matrixTransform2) {
            lastEvent.matrixTransform2 = this.node.gSlotDataStore.convertSlotMatrix(lastEvent.matrixTransform2,tableFormat);
        }
        if (lastEvent.payLines) {
            lastEvent.payLines = this.node.gSlotDataStore.convertPayLine(lastEvent.payLines);
        }
        if (lastEvent.payLineJackPot) {
            lastEvent.payLineJackPot = this.node.gSlotDataStore.convertPayLine(lastEvent.payLineJackPot);
        }

        this.node.gSlotDataStore.lastEvent = lastEvent;
        return lastEvent;
    },
});