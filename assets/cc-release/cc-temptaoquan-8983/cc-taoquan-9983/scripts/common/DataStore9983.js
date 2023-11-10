const BetDataStore = require('MoneyDataStore');
const { convertSlotMatrixTBLR } = require('utils');

cc.Class({
    extends: require('DataStore'),
    properties: {

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
        this.node.gSlotDataStore.convertPayLine = this.convertPayLine.bind(this);
    },


    convertPayLine (payLines = []){
        const listNewPL = [];
        for (let i = 0; i < payLines.length; i++) {
            const dataSplit = payLines[i].split(';');
            if (dataSplit.length >= 3) {
                listNewPL.push({
                    payLineSymbol: dataSplit[0],
                    payLineWinAmount: dataSplit[1],
                    paylineMaxColumn: dataSplit[2],
                    payLineWinNumbers: parseInt(dataSplit[3]),
                    payableSymbol: dataSplit[4],
                    wildMultiplier: dataSplit[5]
                });
            }
        }
        return listNewPL;
    },


    formatData(playSession) {
        const { TABLE_FORMAT } = this.node.config;
        this.node.gSlotDataStore.playSession = playSession;
        let lastEvent;

        const { normalGameResult, freeGameResult, freeSpinOptionResult } = playSession.lastEvent;
        let tableFormat = TABLE_FORMAT;
        if (freeGameResult) {
            lastEvent = freeGameResult;
            lastEvent.type = "freeGame";

            const { freeGameTableFormat } = this.node.gSlotDataStore.playSession;
            if (freeGameTableFormat) tableFormat = freeGameTableFormat;
        } else if (freeSpinOptionResult) {
            lastEvent = freeSpinOptionResult;
            lastEvent.type = "freeSpinOptionResult";
        } else {
            lastEvent = normalGameResult;
            lastEvent.type = "normalGame";
            const { normalGameTableFormat } = this.node.gSlotDataStore.playSession;
            if (normalGameTableFormat) tableFormat = normalGameTableFormat;
        }

        if (lastEvent.matrix) {
            lastEvent.matrix = this.node.gSlotDataStore.convertSlotMatrix(lastEvent.matrix, tableFormat);
        }
        if (lastEvent.matrixTransform0) {
            lastEvent.matrixTransform0 = this.node.gSlotDataStore.convertSlotMatrix(lastEvent.matrixTransform0, tableFormat);
        }
        if (lastEvent.matrixTransform1) {
            lastEvent.matrixTransform1 = this.node.gSlotDataStore.convertSlotMatrix(lastEvent.matrixTransform1, tableFormat);
        }
        if (lastEvent.matrixTransform2) {
            lastEvent.matrixTransform2 = this.node.gSlotDataStore.convertSlotMatrix(lastEvent.matrixTransform2, tableFormat);
        }
        if (lastEvent.payLines) {
            lastEvent.payLines = this.node.gSlotDataStore.convertPayLine(lastEvent.payLines);
        }

        this.node.gSlotDataStore.lastEvent = lastEvent;
        return lastEvent;
    },
});