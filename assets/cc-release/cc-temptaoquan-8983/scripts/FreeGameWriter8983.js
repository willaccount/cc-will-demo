const { findKeyByValue, floatUtils } = require('utils');
const SlotGameWriter = require('SlotGameWriter');
cc.Class({
    extends: SlotGameWriter,

    makeScriptResultReceive() {
        const { type, matrix, jpInfo, freeSpinOptionID, freeSubSymbol1, freeSubSymbol2 } = this.node.gSlotDataStore.lastEvent;
        let { optionResult } = this.node.gSlotDataStore.lastEvent;
        let listScript = [];

        if (jpInfo) {
            listScript.push({
                command: "_pauseUpdateJP"
            });
        }
        listScript.push({
            command: "_resultReceive",
            data: {
                matrix,
                subSymbol1: freeSubSymbol1,
                subSymbol2: freeSubSymbol2
            },
        });
        listScript.push({
            command: "_showResult",
        });


        return listScript;
    },

    makeScriptShowResults() {
        const {
            type, matrix, winAmount, payLines, payLineJackPot,
            freeSubSymbol1, freeSubSymbol2, jackpotJnfo
        } = this.node.gSlotDataStore.lastEvent;

        const { freeWildMultiplier: wildMultiplier } = this.node.gSlotDataStore.lastEvent;

        const { winAmount: winAmountPlaySession, freeGameRemain, winJackpotAmount } = this.node.gSlotDataStore.playSession;
        const { fsor: freeSpinOption } = this.node.gSlotDataStore.playSession.extend;
        const { currentBetData } = this.node.gSlotDataStore.slotBetDataStore.data;
        const listScript = [];
        const isBigwin = winAmount && winAmount >= currentBetData * 20 && !isJackpotWin;
        const { isAutoSpin, modeTurbo } = this.node.gSlotDataStore;
        this.isFastResult = false;

        if (type != 'freeGameOptionResult') {
            listScript.push({
                command: "_setUpPaylines",
                data: { matrix, payLines },
            });
        }
        else {
            listScript.push({
                command: "_hideCutscene",
                data: {
                    name: "FreeGameOption",
                }
            });
        }

        if (jackpotJnfo) {
            listScript.push({
                command: "_showJackpotPayLine",
                data: {
                    freeSubSymbol1,
                    freeSubSymbol2
                },
            });
            listScript.push({
                command: "_showUnskippedCutscene",
                data: {
                    name: "JackpotWin",
                    content: {
                        winAmount: winJackpotAmount,
                        currentBetData,
                        freeSubSymbol1,
                        freeSubSymbol2
                    }
                }
            });
            listScript.push({
                command: "_resumeUpdateJP",
            });
        }
        if (freeSubSymbol1 || freeSubSymbol2) {
            listScript.push({
                command: "_showSmallSubSymbols",
            });
        }
        if (isBigwin) {
            if (isSessionEnded && modeTurbo && !isAutoSpin && !this.isFastResult) {
                this.isFastResult = true;
                listScript.push({
                    command: "_gameRestart"
                });
            }
            if (wildMultiplier && wildMultiplier > 1) {
                listScript.push({
                    command: "_showWildPayline",
                    data: {
                        name: "WildTransition",
                        content: {
                            wildMultiplier,
                        }
                    }
                });
            }
            listScript.push({
                command: "_blinkAllPaylines",
            });
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
        }

        if (freeSpinOption && freeSpinOption > 0) {
            listScript.push({
                command: "_showScatterPayLine",
            });
            listScript.push({
                command: "_showUnskippedCutscene",
                data: {
                    name: "FreeGameOption"
                }
            });
            listScript.push({
                command: "_newGameMode",
                data: {
                    name: "freeGame",
                    data: {
                        matrix: matrix,
                    }
                },
            });
            listScript.push({
                command: "_resumeGameMode",
                data: { name: "normalGame", },
            });
        }

        if (payLines && payLines.length > 0) {
            if (wildMultiplier && wildMultiplier > 1) {
                listScript.push({
                    command: "_showWildPayline",
                    data: {
                        name: "WildTransition",
                        content: {
                            wildMultiplier,
                        }
                    }
                });
            }
            listScript.push({
                command: "_blinkAllPaylines",
            });
            listScript.push({
                command: "_showFreeSymbolPayLine",
            });
        } else {
            listScript.push({
                command: "_clearPaylines",
            });
        }

        if (!freeGameRemain || freeGameRemain <= 0) {
            if (winAmountPlaySession && winAmountPlaySession > 0) {
                listScript.push({
                    command: '_updateWinningAmount',
                    data: {
                        winAmount: winAmountPlaySession,
                        time: 300
                    }
                });
            }
            listScript.push({
                command: "_delayTimeScript",
                data: 0.3
            });
            listScript.push({
                command: "_showUnskippedCutscene",
                data: {
                    name: "TotalWinPanel",
                    content: {}
                }
            });
            listScript.push({
                command: "_gameEnd"
            });
            listScript.push({
                command: "_gameExit",
            });
        } else {
            listScript.push({
                command: "_gameRestart"
            });
        }

        return listScript;
    },
});
