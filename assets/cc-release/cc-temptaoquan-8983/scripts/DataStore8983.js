const { jp } = require('../../../cc-common/cc-slotbase-v2/game-state/MsgKeyMapping');

cc.Class({
    extends: require('DataStorev2'),

    formatData(playSession) {
        const { TABLE_FORMAT } = this.node.config;
        this.node.gSlotDataStore.playSession = playSession;
        let lastEvent;

        const { normalGameResult, freeGameResult, freeSpinOptionResult } = playSession.lastEvent;
        // const { jpInfo } = freeGameResult;
        const { bonusGameRemain, extend, bonusGameMatrix } = playSession;
        let tableFormat = TABLE_FORMAT;

        // if(jpInfo) {
        //     let jackpotProperties = jpInfo.split(',');
        //     const properties = {
        //         jackpotType: Number(jackpotProperties[0]),
        //         jackpotWon: Number(jackpotProperties[1]),
        //     }

        //     lastEvent.jackpotProperties = properties;
        // }
        if (freeSpinOptionResult) {
            const { fsoi: freeSpinOptionID } = playSession.lastEvent.freeSpinOptionResult;
            lastEvent = freeSpinOptionResult;
            lastEvent.type = "freeGameOptionResult";
            if (freeSpinOptionID) {
                let selectedInfo = freeSpinOptionID.split(';');

                const optionResult = {
                    spinAmount: selectedInfo[0],
                    spinAmountIndex: Number(selectedInfo[1]),
                    multiplierIndex: Number(selectedInfo[2]),
                };
                lastEvent.optionResult = optionResult;
            }
        }
        else if (freeGameResult) {
            lastEvent = freeGameResult;
            lastEvent.type = "freeGame";

            const { freeGameTableFormat } = this.node.gSlotDataStore.playSession;
            if (freeGameTableFormat)
                tableFormat = freeGameTableFormat;

            const { jpInfo } = freeGameResult;
            if (jpInfo) {
                let jackpotProperties = jpInfo.split(';');
                const properties = {
                    jackpotType: Number(jackpotProperties[0]),
                    jackpotWon: Number(jackpotProperties[1]),
                }
                lastEvent.jackpotProperties = properties;
            }
        } else {
            lastEvent = normalGameResult;
            lastEvent.type = "normalGame";

            const { normalGameTableFormat } = this.node.gSlotDataStore.playSession;
            if (normalGameTableFormat)
                tableFormat = normalGameTableFormat;
        }

        if (lastEvent.matrix && freeGameResult) {
            lastEvent.matrix = this.node.gSlotDataStore.convertSlotMatrix(lastEvent.matrix, tableFormat);
            const freeSpinMatrix = lastEvent.matrix;
            lastEvent.freeSpinMatrix = freeSpinMatrix;
        } else if (lastEvent.matrix) {
            lastEvent.matrix = this.node.gSlotDataStore.convertSlotMatrix(lastEvent.matrix, tableFormat);
            const normalSpinMatrix = lastEvent.matrix;
            lastEvent.normalSpinMatrix = normalSpinMatrix;
        }

        if (lastEvent.payLines) {
            lastEvent.payLines = this.node.gSlotDataStore.convertPayLine(lastEvent.payLines);
        }

        this.node.gSlotDataStore.playSession.currentBonusCredits = 0;
        if (bonusGameRemain > 0 && bonusGameRemain != extend.cfPlayBonus && bonusGameMatrix) {
            this.node.gSlotDataStore.playSession.bonusGameMatrix.forEach(it => {
                if (it > 0) this.node.gSlotDataStore.playSession.currentBonusCredits += it;
            });
        }

        lastEvent = this._mapNewKeys(lastEvent);

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
            jpInfo: 'jackpotInfo',
            fgo: 'freeGameOption',
            fsoi: 'freeSpinOptionID',
            subSym1: 'subSymbol1',
            subSym2: 'subSymbol2',
            fSubSym1: 'freeSubSymbol1',
            fSubSym2: 'freeSubSymbol2',
            nwm: 'normalWildMultiplier',
            fwm: 'freeWildMultiplier',
        };

        Object.keys(lastEvent).forEach(key => {
            if (mapKeys[key]) {
                const newKey = mapKeys[key];
                lastEvent[newKey] = lastEvent[key];
                delete lastEvent[key];
            }
        });

        return lastEvent;
    },
});