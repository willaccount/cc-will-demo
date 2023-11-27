const SlotGameWriter = require('SlotGameWriter');

cc.Class({
    extends: SlotGameWriter,

    makeScriptResume() {
        const {  normalGamePayLines, freeGameRemain, normalGameMatrix,
            winAmount, betId, currentBonusCredits, isFinished
        } = this.node.gSlotDataStore.playSession;
        const { normalWildMultiplier: wildMultiplier } = this.node.gSlotDataStore.lastEvent;
        const { matrix, freeGameOption, freeSpinMatrix } = this.node.gSlotDataStore.lastEvent;
        const { fgoi: freeGameOptionID } = this.node.gSlotDataStore.playSession.extend;
        const normalPayLines = this.node.gSlotDataStore.convertPayLine(normalGamePayLines);
        const { steps } = this.node.gSlotDataStore.slotBetDataStore.data;
        const { promotion, promotionRemain, promotionTotal } = this.node.gSlotDataStore;

        const listBet = String(betId).split('');
        const betIndex = listBet[0];
        const betValue = steps[betIndex];
        const isFreeGame = (freeGameRemain && freeGameRemain > 0) || false;
        const isFreeGameOption = (freeGameOption && freeGameOption > 0) || false;
        const hasNormalPayline = (normalGamePayLines && normalGamePayLines.length > 0) || false;
        const updatedWinAmount = winAmount - (betValue * currentBonusCredits);
        
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
            data: { 
                matrix: matrix 
            },
        });
        listScript.push({
            command: "_setUpPaylines",
            data: {
                matrix: matrix,
                payLines: normalPayLines
            },
        });

        if (hasNormalPayline) {
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

        if (updatedWinAmount && updatedWinAmount > 0) {
            listScript.push({
                command: "_updateWinningAmount",
                data: { 
                    winAmount: updatedWinAmount, 
                    time: 0 
                }
            });
        }

        if (isFreeGameOption) {
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
                        normalSpinMatrix: matrix,
                        isResume: false,
                    }
                },
            });
            listScript.push({
                command: "_resumeGameMode",
                data: { 
                    name: "normalGame", 
                },
            });
        } else if (isFreeGame) {
            listScript.push({
                command: "_showScatterPayLine",
            });
            listScript.push({
                command: "_newGameMode",
                data: {
                    name: "freeGame",
                    data: {
                        freeSpinMatrix: matrix,
                        isResume: false,
                    },
                },
            });
            listScript.push({
                command: "_resumeGameMode",
                data: { 
                    name: "normalGame", 
                },
            });
        } else if(!isFreeGame && freeSpinMatrix) {
            listScript.push({
                command: "_newGameMode",
                data: {
                    name: "freeGame",
                    data: {
                        freeSpinMatrix: matrix,
                        isResume: true,
                    },
                },
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
        const { type, matrix, jackpotInfo, freeSpinOptionID, subSymbol1, subSymbol2 } = this.node.gSlotDataStore.lastEvent;
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
            if (jackpotInfo) {
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
            type, matrix, winAmount, payLines, jackpotInfo,
            subSymbol1, subSymbol2
        } = this.node.gSlotDataStore.lastEvent;

        const { normalWildMultiplier: wildMultiplier } = this.node.gSlotDataStore.lastEvent;

        const { fgo: freeSpinOption } = this.node.gSlotDataStore.playSession.extend;
        const { currentBetData } = this.node.gSlotDataStore.slotBetDataStore.data;
        const listScript = [];
        const isBigwin = winAmount && winAmount >= currentBetData * 20 && !jackpotInfo;

        if (payLines) {
            listScript.push({
                command: "_setUpPaylines",
                data: {
                    matrix,
                    payLines,
                }
            });
        }
        if (jackpotInfo) {
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
                    command: "_showEachPayLine",
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
