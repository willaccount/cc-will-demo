const { findKeyByValue, floatUtils } = require('utils');
const SlotGameWriter = require('SlotGameWriter');
cc.Class({
    extends: SlotGameWriter,

    makeScriptResume() {
        const { freeSpinMatrix } = this.node.gSlotDataStore.lastEvent;
        const { fgo: freeGameOption } = this.node.gSlotDataStore.playSession.extend;

        let listScript = [];

        if (freeGameOption && freeGameOption > 0) {
            listScript.push({
                command: "_showUnskippedCutscene",
                data: {
                    name: "FreeGameOption"
                }
            });

            listScript.push({
                command: "_updateSpinTimeFreeGameOption",
            });
            listScript.push({
                command: "_delayTimeScript",
                data: 1
            });
            listScript.push({
                command: '_forceState'
            })
            listScript.push({
                command: "_gameRestart"
            });
        }

        return listScript;
    },

    makeScriptResultReceive() {
        const { type, freeSpinMatrix, freeSubSymbol1, freeSubSymbol2, jackpotProperties } = this.node.gSlotDataStore.lastEvent;
        let { optionResult } = this.node.gSlotDataStore.lastEvent;
        const { freeGameRemain } = this.node.gSlotDataStore.playSession;
        let listScript = [];

        if (type == 'freeGameOptionResult') {
            this.node.gSlotDataStore.spinTimes = freeGameRemain;
            this.node.gSlotDataStore.fsoi = optionResult;
            listScript.push({
                command: "_showResultFreeGameOption",
                data: {
                    name: "FreeGameOption",
                    content: {
                        optionResult: optionResult,
                    },
                }
            });
        } else {
            if (jackpotProperties) {
                const { jackpotType, jackpotWon } = jackpotProperties;

                listScript.push({
                    command: "_updateValueJP",
                    data: {
                        isGrand: (jackpotType == '0') ? true : false,
                        value: jackpotWon
                    }
                });
                listScript.push({
                    command: "_pauseUpdateJP"
                });
            }
            listScript.push({
                command: "_resultReceive",
                data: {
                    matrix: freeSpinMatrix,
                    subSymbol1: freeSubSymbol1,
                    subSymbol2: freeSubSymbol2
                },
            });
            listScript.push({
                command: "_showResult",
            });
        }

        return listScript;
    },

    makeScriptShowResults() {
        const {
            type, freeSpinMatrix, winAmount, payLines, jackpotInfo,
            freeSubSymbol1, freeSubSymbol2, freeSpinOptionRemain
        } = this.node.gSlotDataStore.lastEvent;

        const { freeWildMultiplier: wildMultiplier } = this.node.gSlotDataStore.lastEvent;
        const { freeGameRemain, winAmount: winAmountPlaySession } = this.node.gSlotDataStore.playSession;
        const { fgoi: freeGameOptionID, fgo: freeSpinOption } = this.node.gSlotDataStore.playSession.extend;
        const { currentBetData } = this.node.gSlotDataStore.slotBetDataStore.data;
        const listScript = [];
        const isBigwin = winAmount && winAmount >= currentBetData * 20 && !jackpotInfo;

        if (payLines) {
            listScript.push({
                command: "_setUpPaylines",
                data: {
                    freeSpinMatrix,
                    payLines,
                }
            });
        }
        if (jackpotInfo) {
            listScript.push({
                command: "_showJackpotPayLine",
                data: {
                    subSymbol1: freeSubSymbol1,
                    subSymbol2: freeSubSymbol2
                },
            });
            listScript.push({
                command: "_showUnskippedCutscene",
                data: {
                    name: "JackpotWin",
                    content: {
                        winAmount,
                        currentBetData,
                        subSymbol1: freeSubSymbol1,
                        subSymbol2: freeSubSymbol2
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
            if (wildMultiplier && wildMultiplier > 1) {
                listScript.push({
                    command: "_showWildMultiplier",
                    data: {
                        name: "WildTransition",
                        content: {
                            wildMultiplier,
                            freeGameOptionID
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
        if (payLines && payLines.length > 0) {
            listScript.push({
                command: "_resetSymbolPayline",
            });
        }
        if (freeSpinOptionRemain) {
            if (!freeGameRemain || freeGameRemain <= 0) {
                listScript.push({
                    command: "_updateOptionRemain",
                    data: freeSpinOptionRemain - 1,
                });
            } else {
                listScript.push({
                    command: "_updateOptionRemain",
                    data: freeSpinOptionRemain,
                });
            }
        }
        if (isBigwin) {
            listScript.push({
                command: "_showNormalPayline",
            });
        } else {
            if (payLines && payLines.length > 0) {
                if (wildMultiplier && wildMultiplier > 1) {
                    listScript.push({
                        command: "_showWildPayline",
                        data: {
                            name: "WildTransition",
                            content: {
                                wildMultiplier,
                                freeGameOptionID,
                            }
                        }
                    });
                }
                listScript.push({
                    command: "_blinkAllPaylines",
                });
                listScript.push({
                    command: "_showEachPayLine",
                });
            } else {
                listScript.push({
                    command: "_clearPaylines",
                });
            }
        }

        if (!freeGameRemain || freeGameRemain <= 0) {
            if (freeSpinOption && freeSpinOption > 0) {
                listScript.push({
                    command: "_showUnskippedCutscene",
                    data: {
                        name: "FreeGameOption"
                    }
                });
                listScript.push({
                    command: "_updateSpinTimeFreeGameOption",
                });
                listScript.push({
                    command: "_updateOptionRemain",
                    data: freeSpinOptionRemain,
                });
                listScript.push({
                    command: "_delayTimeScript",
                    data: 1
                });
                listScript.push({
                    command: "_gameRestart"
                });
            } else {
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
            }

        } else {
            listScript.push({
                command: "_gameRestart"
            });
        }

        return listScript;
    },

    makeScriptGameRestart() {
        const listScript = [];
        const { winAmount } = this.node.gSlotDataStore.playSession;
        const { spinTimes, gameSpeed } = this.node.gSlotDataStore;
        const isFTR = gameSpeed === this.node.config.GAME_SPEED.INSTANTLY;
        if (winAmount && winAmount > 0) {
            if (winAmount > 0) {
                listScript.push({
                    command: "_updateWinningAmount",
                    data: { winAmount, time: isFTR ? 50 : 300 }
                });
            }
            listScript.push({
                command: "_updateLastWin",
                data: false,
            });
        }
        if (spinTimes && spinTimes > 0) {
            listScript.push({
                command: "_runAutoSpin"
            });
        }
        return listScript;
    },
});
