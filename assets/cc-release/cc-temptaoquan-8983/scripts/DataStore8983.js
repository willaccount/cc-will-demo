const { jp } = require('../../../cc-common/cc-slotbase-v2/game-state/MsgKeyMapping');

cc.Class({
    extends: require('DataStorev2'),

    formatData(playSession) {
        const { TABLE_FORMAT } = this.node.config;
        this.node.gSlotDataStore.playSession = playSession;
        let lastEvent;

        const { normalGameResult, freeGameResult, freeSpinOptionResult } = playSession.lastEvent;
        const { bonusGameRemain, extend, bonusGameMatrix } = playSession;
        const { normalGameTableFormat, normalGameMatrix } = this.node.gSlotDataStore.playSession;
        const { freeGameTableFormat, freeGameMatrix } = this.node.gSlotDataStore.playSession;

        let tableFormat = TABLE_FORMAT;
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
        }

        if (freeGameResult) {
            const freeSpinMatrix = this.node.gSlotDataStore.convertSlotMatrix(freeGameMatrix, freeGameTableFormat);
            lastEvent.freeSpinMatrix = freeSpinMatrix;
        }
        const normalSpinMatrix = this.node.gSlotDataStore.convertSlotMatrix(normalGameMatrix, normalGameTableFormat);
        lastEvent.normalSpinMatrix = normalSpinMatrix;

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
            fsor: 'freeSpinOptionRemain'
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