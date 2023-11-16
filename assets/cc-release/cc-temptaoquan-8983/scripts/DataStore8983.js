cc.Class({
    extends: require('DataStorev2'),

    formatData(playSession) {
        const {TABLE_FORMAT} = this.node.config;
        this.node.gSlotDataStore.playSession = playSession;
        let lastEvent;

        const {normalGameResult, freeGameResult, bonusGameResult, freeSpinOptionResult, freeSpinOptionID} = playSession.lastEvent;
        const {bonusGameRemain, extend, bonusGameMatrix} = playSession;
        let tableFormat = TABLE_FORMAT;

        if (bonusGameResult) {
            lastEvent = bonusGameResult;
            lastEvent.type = "bonusGame";
        } 
        else if (freeSpinOptionResult) {
            lastEvent = freeSpinOptionResult;
            lastEvent.type = "freeGameOptionResult";
            if(freeSpinOptionID) {
                let freeSpinOptionResults = freeSpinOptionResult.split(';')
                lastEvent.freeSpinOptionResult = {
                    spinAmount: freeSpinOptionResults[0],
                    spinAmountIndex: freeSpinOptionResults[1],
                    multiplierIndex: freeSpinOptionResults[2],
                };
            }
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
            jpInfo: 'jackpotJnfo',
            fgo: 'freeGameOption',
            fsoi: 'freeSpinOptionID'
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