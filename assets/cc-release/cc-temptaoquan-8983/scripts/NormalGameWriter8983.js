const SlotGameWriter = require('SlotGameWriter');

cc.Class({
    extends: SlotGameWriter,

    makeScriptResultReceive() {
        const { type, matrix, jpInfo, freeSpinOptionID, subSymbol1, subSymbol2 } = this.node.gSlotDataStore.lastEvent;
        let { optionResult } = this.node.gSlotDataStore.lastEvent;
        let listScript = [];

        if (type == 'freeGameOptionResult') {
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
            if (jpInfo) {
                listScript.push({
                    command: "_pauseUpdateJP"
                });
            }
            listScript.push({
                command: "_resultReceive",
                data: {
                    matrix,
                    subSymbol1,
                    subSymbol2
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
            type, matrix, winAmount, payLines, payLineJackPot, wildMutiplier,
            freeGame, freeGameOption, freeSpinOptionID, subSymbol1, subSymbol2
        } = this.node.gSlotDataStore.lastEvent;

        const { winAmount: winAmountPlaySession, freeGameRemain, winJackpotAmount } = this.node.gSlotDataStore.playSession;
        const { fgo: freeSpinOption } = this.node.gSlotDataStore.playSession.extend;
        const { currentBetData } = this.node.gSlotDataStore.slotBetDataStore.data;
        const listScript = [];
        const isBigwin = winAmount && winAmount >= currentBetData * 20 && !isJackpotWin;
        const isJackpotWin = winJackpotAmount && winJackpotAmount > 0;

        if (payLines) {
            listScript.push({
                command: "_setUpPaylines",
                data: {
                    matrix,
                    payLines,
                }
            });
        }

        if (isJackpotWin) {
            listScript.push({
                command: "_showJackpotPayLine",
                data: {
                    subSymbol1,
                    subSymbol2
                },
            });
            listScript.push({
                command: "_showUnskippedCutscene",
                data: {
                    name: "JackpotWin",
                    content: {
                        winAmount: winJackpotAmount,
                        currentBetData,
                        subSymbol1,
                        subSymbol2
                    }
                }
            });
            listScript.push({
                command: "_resumeUpdateJP",
            });
        }
        if (subSymbol1 || subSymbol2) {
            listScript.push({
                command: "_showSmallSubSymbols",
            });
        }

        if (isBigwin) {
            // if (nwm && nwm > 1) {
            //     listScript.push({
            //         command: "_showWildMultiplier",
            //         data: {
            //             name: "WildTransition",
            //             content: {
            //                 nwm,
            //             }
            //         }
            //     });
            // }
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
        if(payLines && payLines.length > 0) {
            listScript.push({
                command: "_resetSymbolPayline",
            });
        }
        if (isBigwin) {
            listScript.push({
                command: "_showNormalPayline",
            });
        } else {
            if (wildMutiplier && wildMutiplier > 1) {
                // listScript.push({
                //     command: "_showWildMultiplier",
                //     data: {
                //         name: "WildTransition",
                //         content: {
                //             wildMutiplier,
                //         }
                //     }
                // });
            }
            if (payLines && payLines.length > 0) {
                listScript.push({
                    command: "_blinkAllPaylines",
                });
                listScript.push({
                    command: "_showNormalPayline",
                });
            } else {
                listScript.push({
                    command: "_clearPaylines",
                });
            }
        }

        listScript.push({
            command: "_gameEnd"
        });
        listScript.push({
            command: "_gameFinish"
        });
        listScript.push({
            command: "_gameRestart"
        });
        return listScript;

    },

});
