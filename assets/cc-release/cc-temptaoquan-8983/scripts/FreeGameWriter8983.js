const { findKeyByValue, floatUtils } = require('utils');
const SlotGameWriter = require('SlotGameWriter');
cc.Class({
    extends: SlotGameWriter,

    makeScriptResume() {
        const {
            normalGameTableFormat, bonusGameMatrix, normalGameMatrix, normalGamePayLines, bonusGameRemain, freeGameRemain,
            freeGameMatrix, winAmount, betId, freeGameTableFormat, currentBonusCredits, isFinished
        } = this.node.gSlotDataStore.playSession;
        const { fsor: freeSpinOption } = this.node.gSlotDataStore.playSession.extend;
        const normalSpinMatrix = this.node.gSlotDataStore.convertSlotMatrix(normalGameMatrix, normalGameTableFormat);
        const normalPayLines = this.node.gSlotDataStore.convertPayLine(normalGamePayLines);
        const { steps } = this.node.gSlotDataStore.slotBetDataStore.data;
        const listBet = String(betId).split('');
        const betIndex = listBet[0];
        const betValue = steps[betIndex];
        const isBonusGameInNormal = (bonusGameRemain && bonusGameRemain > 0 && !freeGameMatrix);
        const isBonusGameInFree = (bonusGameRemain && bonusGameRemain > 0 && !isBonusGameInNormal);
        const isFreeGame = ((freeGameRemain && freeGameRemain > 0) || isBonusGameInFree);
        const { promotion, promotionRemain, promotionTotal } = this.node.gSlotDataStore;

        let listScript = [];

        listScript.push({
            command: "_updateBet",
            data: betValue
        });
        listScript.push({
            command: "_disableBet",
        });
        listScript.push({
            command: "_showTrialButtons",
            data: false
        });
        listScript.push({
            command: "_updateBet",
            data: betValue
        });
        listScript.push({
            command: "_updateMatrix",
            data: { matrix: normalSpinMatrix },
        });
        listScript.push({
            command: "_setUpPaylines",
            data: { matrix: normalSpinMatrix, payLines: normalPayLines },
        });
        if (!isFinished) {
            listScript.push({
                command: "_hideAnimIntro",
            });
        }
        const updatedWinAmount = winAmount - (betValue * currentBonusCredits);
        if (updatedWinAmount && updatedWinAmount > 0) {
            listScript.push({
                command: "_updateWinningAmount",
                data: { winAmount: updatedWinAmount, time: 0 }
            });
        }
        if (freeSpinOption && freeSpinOption > 0) {
            listScript.push({
                command: "_showCutscene",
                data: {
                    name: "FreeGameOption"
                }
            });
        }
        if (isFreeGame || isBonusGameInFree) {
            let freeSpinMatrix = normalSpinMatrix;
            if (freeGameMatrix) {
                freeSpinMatrix = this.node.gSlotDataStore.convertSlotMatrix(freeGameMatrix, freeGameTableFormat);
            }
            if (isBonusGameInFree) {
                listScript.push({
                    command: "_newGameMode",
                    data: {
                        name: "bonusGame",
                        data: bonusGameMatrix
                    },
                });
            }
            if (freeGameRemain && freeGameRemain > 0)
                listScript.push({
                    command: "_newGameMode",
                    data: { name: "freeGame", data: freeSpinMatrix, },
                });
            listScript.push({
                command: "_resumeGameMode",
                data: { name: "normalGame", },
            });
        }
        if (normalPayLines && normalPayLines.length > 0) {
            listScript.push({
                command: "_showNormalSymbolPayLine",
            });
        } else {
            listScript.push({
                command: "_clearPaylines",
            });
        }
        listScript.push({
            command: "_gameFinish"
        });
        listScript.push({
            command: "_gameRestart"
        });

        return listScript;
    },
});
