

cc.Class({
    extends: cc.Component,
    onLoad() {
        this.node.writer = this;
    },

    makeScriptMiniGameStart() {
        const listScript = [];

        listScript.push({
            command: "_miniGameStart",
        });
        return listScript;
    },

    makeScriptMiniGameClick() {
        let itemId = this.node.currentPick;
        return [
            {command: "_sendRequestPlayMiniGame", data: {openCell: itemId}},
        ];
    },

    makeScriptResultReceive() {
        return [
            {command: "_showResult"},
        ];
    },

    makeScriptShowResult() {
        const listScript = [];
        const {winAmount, bonusPlayRemain, bonusGameMatrix} = this.node.gSlotDataStore.playSession;
        const {currentBetData} = this.node.gSlotDataStore.slotBetDataStore.data;
        const {symV} = this.node.gSlotDataStore.lastEvent;

        let itemId = this.node.currentPick;
        listScript.push({
            command: "_openPickedItem",
            data: {index: itemId, value: symV}
        });

        if (winAmount && winAmount > 0) {
            listScript.push({
                command: "_updateWinningAmount",
                data: {winAmount}
            });
        }

        if (bonusPlayRemain) {
            listScript.push({
                command: "_miniGameRestart"
            });
            return listScript;
        } else {
            listScript.push({
                command: "_openAllItems",
                data: bonusGameMatrix
            });
            if(!this.node.gSlotDataStore.modeTurbo) {
                listScript.push({
                    command: "_showCutscene",
                    data: {
                        name: "WinEffect",
                        content: {
                            winAmount,
                            currentBetData
                        }
                    }
                }); 
            } else {
                listScript.push({
                    command: "_showCutscene",
                    data: {
                        name: "TotalWinPanel",
                        content: {}
                    }
                });
            }
            listScript.push({
                command: "_gameExit",
            });
            return listScript;
        }
    }
});