const SlotGameWriter = require('SlotGameWriter');

cc.Class({
    extends: SlotGameWriter,

    makeScriptResume() {
        const {  normalGamePayLines, freeGameRemain,
            winAmount, betId, currentBonusCredits, isFinished
        } = this.node.gSlotDataStore.playSession;
        const { normalWildMultiplier: wildMultiplier } = this.node.gSlotDataStore.lastEvent;
        const { freeGameOption, freeSpinMatrix, normalSpinMatrix } = this.node.gSlotDataStore.lastEvent;
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
                matrix: normalSpinMatrix 
            },
        });
        listScript.push({
            command: "_setUpPaylines",
            data: {
                matrix: normalSpinMatrix,
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

        if (winAmount && winAmount > 0) {
            listScript.push({
                command: "_updateWinningAmount",
                data: { 
                    winAmount: winAmount, 
                    time: 0 
                }
            });
        }

        if (isFreeGameOption) {
            listScript.push({
                command: "_showScatterPayLine",
            });
            listScript.push({
                command: "_showCutscene",
                data: {
                    name: "ScatterTransition",
                    content: {}
                }
            });
            listScript.push({
                command: "_showCutscene",
                data: {
                    name: "CloudsTransition",
                    content: {}
                }
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
                        freeSpinMatrix: normalSpinMatrix,
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
                        freeSpinMatrix: freeSpinMatrix,
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
                command: "_showCutscene",
                data: {
                    name: "CloudsTransition",
                    content: {}
                }
            });
            listScript.push({
                command: "_newGameMode",
                data: {
                    name: "freeGame",
                    data: {
                        freeSpinMatrix: freeSpinMatrix,
                        isResume: true,
                    },
                },
            });
            listScript.push({
                command: "_resumeGameMode",
                data: { 
                    name: "normalGame", 
                },
            });
        }

        if (normalGamePayLines && normalGamePayLines.length > 0) {
            if (wildMultiplier && wildMultiplier > 1) {
                listScript.push({
                    command: "_showWildPayline",
                });
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
        const { type, normalSpinMatrix, jackpotInfo, freeSpinOptionID, subSymbol1, subSymbol2 } = this.node.gSlotDataStore.lastEvent;
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
                    matrix: normalSpinMatrix,
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
            type, normalSpinMatrix, winAmount, payLines, jackpotInfo,
            subSymbol1, subSymbol2
        } = this.node.gSlotDataStore.lastEvent;

        const { normalWildMultiplier: wildMultiplier } = this.node.gSlotDataStore.lastEvent;

        const { fgo: freeSpinOption } = this.node.gSlotDataStore.playSession.extend;
        const { currentBetData } = this.node.gSlotDataStore.slotBetDataStore.data;
        const listScript = [];
        const isBigwin = winAmount && winAmount >= currentBetData * 20 && !jackpotInfo;
        const { gameSpeed } = this.node.gSlotDataStore;
        const isFastToResult = gameSpeed === this.node.config.GAME_SPEED.INSTANTLY;

        if (payLines) {
            listScript.push({
                command: "_setUpPaylines",
                data: {
                    normalSpinMatrix,
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
                            isFastToResult
                        }
                    }
                });
            }
            listScript.push({
                command: "_blinkAllPaylines_2",
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
            if (winAmount && winAmount > 0) {
                listScript.push({
                    command: "_updateWinningAmountSync",
                    data: { 
                        winAmount: winAmount, 
                        time: 0 
                    }
                });
            }
        }
        if (freeSpinOption && freeSpinOption > 0) {
            listScript.push({
                command: "_setupScatterPaylines",
            });
            listScript.push({
                command: "_showScatterPayLine",
            });
            listScript.push({
                command: "_showCutscene",
                data: {
                    name: "ScatterTransition",
                    content: {}
                }
            });
            listScript.push({
                command: "_showCutscene",
                data: {
                    name: "CloudsTransition",
                    content: {}
                }
            });
            listScript.push({
                command: "_showUnskippedCutscene",
                data: {
                    name: "FreeGameOption"
                }
            });
            listScript.push({
                command: "_showCutscene",
                data: {
                    name: "CloudsTransition",
                    content: {}
                }
            });
            listScript.push({
                command: "_newGameMode",
                data: {
                    name: "freeGame",
                    data: {
                        freeSpinMatrix: normalSpinMatrix,
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
                        command: "_showWildMultiplier",
                        data: {
                            name: "WildTransition",
                            content: {
                                wildMultiplier,
                                isFastToResult
                            }
                        }
                    });
                }
                listScript.push({
                    command: "_blinkAllPaylines_2",
                });
                listScript.push({
                    command: "_showEachPayLine",
                });
            } else {
                listScript.push({
                    command: "_clearPaylines",
                });
            }
            if (winAmount && winAmount > 0) {
                listScript.push({
                    command: "_updateWinningAmountSync",
                    data: { 
                        winAmount: winAmount, 
                        time: 0 
                    }
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

    makeScriptGameRestart() {
        const listScript = [];
        const { spinTimes, isAutoSpin, promotion, promotionRemain } = this.node.gSlotDataStore;

        if (promotion) {
            listScript.push({
                command: "_resetPromotionButtons"
            });
        }
        if (spinTimes && spinTimes > 0 && !promotion) {
            listScript.push({
                command: "_runAutoSpin"
            });
        } else {
            if (!promotionRemain || promotionRemain <= 0) {
                listScript.push({
                    command: "_enableBet"
                });
                listScript.push({
                    command: "_exitPromotionMode"
                });
            }
            if (isAutoSpin) {
                this.node.gSlotDataStore.isAutoSpin = false;
                listScript.push({
                    command: "_resetSpinButton",
                });
            }
        }
        listScript.push({
            command: "_runAsyncScript",
        });
        return listScript;
    },
});
