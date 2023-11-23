const SlotGameWriter = require('SlotGameWriter');

cc.Class({
    extends: SlotGameWriter,

    makeScriptResume() {
        const {
            normalGameTableFormat, normalGameMatrix, normalGamePayLines, freeGameRemain,
            freeGameMatrix, winAmount, betId, freeGameTableFormat, currentBonusCredits, isFinished
        } = this.node.gSlotDataStore.playSession;

        const { normalWildMultiplier: wildMultiplier } = this.node.gSlotDataStore.lastEvent;
        const { fgo: freeGameOption } = this.node.gSlotDataStore.playSession.extend;
        const normalSpinMatrix = this.node.gSlotDataStore.convertSlotMatrix(normalGameMatrix, normalGameTableFormat);
        const normalPayLines = this.node.gSlotDataStore.convertPayLine(normalGamePayLines);
        const { steps } = this.node.gSlotDataStore.slotBetDataStore.data;
        const listBet = String(betId).split('');
        const betIndex = listBet[0];
        const betValue = steps[betIndex];
        const isFreeGame = (freeGameRemain && freeGameRemain > 0) || false;
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
        if (normalGamePayLines && normalGamePayLines.length > 0) {
            if (wildMultiplier && wildMultiplier > 1) {
                listScript.push({
                    command: "_showWildMultiplier",
                    data: {
                        name: "WildTransition",
                        content: {
                            wildMultiplier,
                        }
                    }
                });
            }
        }
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
        if (freeGameOption && freeGameOption > 0) {
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
                        matrix: normalSpinMatrix,
                    }
                },
            });
            listScript.push({
                command: "_resumeGameMode",
                data: { name: "normalGame", },
            });
        } else if (isFreeGame) {
            let freeSpinMatrix = normalSpinMatrix;
            if (freeGameMatrix) {
                freeSpinMatrix = this.node.gSlotDataStore.convertSlotMatrix(freeGameMatrix, freeGameTableFormat);
            }
            listScript.push({
                command: "_showScatterPayLine",
            });
            listScript.push({
                command: "_newGameMode",
                data: { name: "freeGame", data: freeSpinMatrix, },
            });
            listScript.push({
                command: "_resumeGameMode",
                data: { name: "normalGame", },
            });
        }
        if (normalGamePayLines && normalGamePayLines.length > 0) {
            if (wildMultiplier && wildMultiplier > 1) {
                listScript.push({
                    command: "_showWildMultiplier",
                    data: {
                        name: "WildTransition",
                        content: {
                            wildMultiplier,
                        }
                    }
                });
            }
            listScript.push({
                command: "_resetSymbolPayline",
            });
            listScript.push({
                command: "_showNormalPayline",
            });
        } else {
            listScript.push({
                command: "_clearPaylines",
            });
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

        if (promotion === true && promotionRemain && promotionTotal && promotionRemain > 0) {
            listScript.push({
                command: "_showPromotionPopup",
            });
        }

        return listScript;
    },

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
            type, matrix, winAmount, payLines, jackpotJnfo,
            subSymbol1, subSymbol2
        } = this.node.gSlotDataStore.lastEvent;

        const { normalWildMultiplier: wildMultiplier } = this.node.gSlotDataStore.lastEvent;

        const { fgo: freeSpinOption } = this.node.gSlotDataStore.playSession.extend;
        const { currentBetData } = this.node.gSlotDataStore.slotBetDataStore.data;
        const listScript = [];
        const isBigwin = winAmount && winAmount >= currentBetData * 20;

        if (payLines) {
            listScript.push({
                command: "_setUpPaylines",
                data: {
                    matrix,
                    payLines,
                }
            });
        }
        if (jackpotJnfo) {
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
                        winAmount,
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
            if (wildMultiplier && wildMultiplier > 1) {
                listScript.push({
                    command: "_showWildMultiplier",
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
                command: "_blinkAllPaylines",
            });
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
            listScript.push({
                command: "_resetSymbolPayline",
            });
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
                            }
                        }
                    });
                }
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
