const SlotGameWriter = require('SlotGameWriter');
const { findKeyByValue } = require('utils');
cc.Class({
    extends: SlotGameWriter,

    makeScriptResume() {
        const listScript = [];
        const data = this.node.gSlotDataStore.playSession;
        const { freeGameMatrix, freeGameRemain, betId, winAmount, normalGameMatrix, normalGamePayLines, } = data;
        const { fsor, fgoi, fgo, nwm, fwm } = data.extend;
        const { promotion, promotionRemain, promotionTotal } = this.node.gSlotDataStore;
        listScript.push({
            command: "_showCutscene",
            data: {
                name: "Resume"
            }
        });

        const { steps } = this.node.gSlotDataStore.slotBetDataStore.data;
        const listBet = String(betId).split('');
        const betIndex = listBet[0];
        const betValue = steps[betIndex];
        listScript.push({
            command: "_updateBet",
            data: betValue
        });
        listScript.push({
            command: "_disableBet"
        });

        const { normalGameTableFormat } = this.node.gSlotDataStore.playSession;
        const normalSpinMatrix = this.node.gSlotDataStore.convertSlotMatrix(normalGameMatrix, normalGameTableFormat);
        const normalPayLines = this.node.gSlotDataStore.convertPayLine(normalGamePayLines);
        listScript.push({
            command: "_updateMatrix",
            data: { matrix: normalSpinMatrix },
        });
        listScript.push({
            command: "_setUpPaylines",
            data: { matrix: normalSpinMatrix, payLines: normalPayLines },
        });

        if (nwm && nwm > 1) {
            listScript.push({
                command: "_resumeMultiply",
                data: nwm
            });
        }
        if (winAmount && winAmount > 0) {
            listScript.push({
                command: "_updateWinningAmount",
                data: { winAmount, time: 300 }
            });
        }

        if ((fgo && data.freeGameTotal)) {
            listScript.push({
                command: "_playSFXCloud2",
            });
            listScript.push({
                command: "_showCutscene",
                data: {
                    name: "CloudTransition",
                    content: {}
                }
            });
            listScript.push({
                command: "_showFreeGameOption",
                data: {
                    name: "FreeGameOption",
                    content: {
                        mode: "free"
                    }
                }
            });
            listScript.push({
                command: "_newGameMode",
                data: { name: "freeGame", data: { fsor, fgoi, fwm } },
            });
            listScript.push({
                command: "_resumeGameMode",
                data: { name: "normalGame", },
            });
        } else if (fgo) {
            listScript.push({
                command: "_playSFXLenChau",
            });
            listScript.push({
                command: "_showScatterPayLine",
            });

            listScript.push({
                command: "_showCutscene",
                data: {
                    name: "ScatterTransition",
                    content: {
                        matrix: normalSpinMatrix,
                        isNormal: true
                    }
                }
            });
            listScript.push({
                command: "_playSFXCloud1",
            });
            listScript.push({
                command: "_showCutscene",
                data: {
                    name: "CloudTransition",
                    content: {}
                }
            });

            listScript.push({
                command: "_showFreeGameOption",
                data: {
                    name: "FreeGameOption",
                    content: {
                        mode: "normal"
                    }
                }
            });
            listScript.push({
                command: "_newGameMode",
                data: { name: "freeGame", data: { fsor, fgoi, fwm } },
            });
            listScript.push({
                command: "_resumeGameMode",
                data: { name: "normalGame", },
            });
        } else if (freeGameRemain && freeGameRemain > 0) {
            let freeSpinMatrix;
            if (freeGameMatrix) {
                const { freeGameTableFormat } = this.node.gSlotDataStore.playSession;
                freeSpinMatrix = this.node.gSlotDataStore.convertSlotMatrix(freeGameMatrix, freeGameTableFormat);
            }

            listScript.push({
                command: "_showScatterPayLine",
            });
            if (freeSpinMatrix) {
                freeSpinMatrix[0].unshift("1");
                freeSpinMatrix[4].unshift("1");
            }
            listScript.push({
                command: "_newGameMode",
                data: { name: "freeGame", data: { matrix: freeSpinMatrix, fsor, fgoi, fwm } },
            });
            listScript.push({
                command: "_resumeGameMode",
                data: { name: "normalGame", },
            });
        }
        if (normalPayLines && normalPayLines.length > 0) {
            listScript.push({
                command: "_showEachPayLine",
            });
        } else {
            listScript.push({
                command: "_clearPaylines",
            });
        }
        listScript.push({
            command: "_resumeWallet",
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

    makeScriptSpinClick() {
        let listScript = [];
        const { currentBetData, steps, currentExtraBetData, extraSteps } = this.node.gSlotDataStore.slotBetDataStore.data;
        const { winAmount } = this.node.gSlotDataStore.playSession;
        const betIndex = findKeyByValue(steps, currentBetData);
        const extraBetIndex = findKeyByValue(extraSteps, currentExtraBetData);
        const { spinTimes, isAutoSpin, promotion, promotionBetId, promotionRemain } = this.node.gSlotDataStore;
        let availableSpinTimes = '';

        if (promotion && promotionRemain > 0) {
            availableSpinTimes = promotionRemain - 1;
            listScript.push({
                command: "_updatePromotionRemain",
                data: availableSpinTimes
            });
        } else if (isAutoSpin) {
            if (spinTimes && spinTimes > 0) {
                availableSpinTimes = spinTimes - 1;
            }
        } else {
            availableSpinTimes = 0;
        }
        this.node.gSlotDataStore.spinTimes = availableSpinTimes;

        const canISpin = this.node.gSlotDataStore.slotBetDataStore.calculateWalletAfterClickSpin();

        if (canISpin >= 0 || promotion === true) {
            if (canISpin >= 0 && !promotion) {
                this.node.gSlotDataStore.slotBetDataStore.updateWalletAfterClickSpin();
            }
            if (winAmount > 0) {
                listScript.push({
                    command: "_updateLastWin",
                    data: true
                });
            }
            listScript.push({
                command: "_clearPaylines"
            });
            listScript.push({
                command: "_updateSpinTimes",
                data: availableSpinTimes
            });
            listScript.push({
                command: "_updateWallet",
            });
            listScript.push({
                command: '_clearWinAmount'
            });
            listScript.push({
                command: "_showTrialButtons",
                data: false
            });
            if (promotion) {
                listScript.push({
                    command: "_sendSpinToNetwork",
                    data: { currentBetData: promotionBetId }
                });
            } else {
                listScript.push({
                    command: "_sendSpinToNetwork",
                    data: { currentBetData: betIndex + "" + extraBetIndex }
                });
            }
            listScript.push({
                command: "_disableBet"
            });
            listScript.push({
                command: "_spinClick"
            });
            return listScript;
        } else {
            this.node.gSlotDataStore.spinTimes = 0;
            listScript = [
                {
                    command: "_enableBet",
                },
                {
                    command: "_resetSpinButton",
                },
                {
                    command: "_clearPaylines",
                },
                {
                    command: "_showMessageNoMoney",
                },
            ];
            return listScript;
        }
    },

    makeScriptResultReceive() {
        const { matrix, subSym1, subSym2, nwm, type, fsoi, jpInfo } = this.node.gSlotDataStore.lastEvent;
        if (type == 'freeSpinOptionResult') {
            this.node.gSlotDataStore.fsoi = fsoi;
            const listScript = [];
            listScript.push({
                command: "_hideCutscene",
                data: {
                    name: "FreeGameOption",
                }
            });
            return listScript;
        } else {
            const listScript = [];
            if (jpInfo) {
                const jackpotInfoArr = jpInfo.split(';');
                const jackpotAmount = Number(jackpotInfoArr[1]);
                const jackpotId = jackpotInfoArr[0];
                listScript.push({
                    command: "_updateValueJP",
                    data: {
                        isGrand: (jackpotId == '0') ? true : false,
                        value: jackpotAmount
                    }
                });
                listScript.push({
                    command: "_pauseUpdateJP",
                });
            }
            listScript.push({
                command: "_resultReceive",
                data: { matrix, subSym1, subSym2, nwm }
            });
            listScript.push({
                command: "_showResult",
                data: matrix,
            });
            return listScript;
        }
    },

    makeScriptShowResults() {
        const listScript = [];
        const { payLines, matrix, fgo, jpInfo } = this.node.gSlotDataStore.lastEvent;

        listScript.push({
            command: "_clearPaylines",
        });
        listScript.push({
            command: "_setUpPaylines",
            data: { matrix, payLines: payLines },
        });
        if (!jpInfo) {
            listScript.push({
                command: "_hideSubSymbolPayLine",
            });
        } else {
            const jackpotInfoArr = jpInfo.split(';');
            const jackpotAmount = Number(jackpotInfoArr[1]);
            const jackpotId = jackpotInfoArr[0];

            listScript.push({
                command: "_showSubSymbolPayLine",
                data: jackpotId
            });

            listScript.push({
                command: "_showUnskippedCutscene",
                data: {
                    name: "JackpotWin",
                    content: {
                        jackpotId,
                        jackpotAmount
                    }
                }
            });

            listScript.push({
                command: "_addWinningAmount",
                data: { winAmount: jackpotAmount, time: 300 }
            });
            listScript.push({
                command: "_resumeUpdateJP",
            });
            listScript.push({
                command: "_hideSubSymbolPayLine",
            });
        }

        if (fgo) {

            this.scriptNormalGameAndFreeGameOption(listScript);
        } else if (payLines && payLines.length > 0) {
            this.scriptNormalGame(listScript);
        } else {
            listScript.push({
                command: "_clearPaylines",
            });
            listScript.push({
                command: "_gameRestart"
            });
        }

        return listScript;
    },

    //Function Support
    scriptNormalGameAndFreeGameOption(listScript) {
        const { payLines, winAmount, jpInfo, nwm, matrix } = this.node.gSlotDataStore.lastEvent;
        const { currentBetData } = this.node.gSlotDataStore.slotBetDataStore.data;
        const { spinTimes } = this.node.gSlotDataStore;
        const winAmountPlaySession = this.node.gSlotDataStore.playSession.winAmount;

        if (payLines && payLines.length > 0) {
            const showBigWin = winAmount && winAmount >= currentBetData * 10 && !jpInfo;
            if (showBigWin) {
                listScript.push({
                    command: "_showAllPayLine",
                });
                if (nwm && nwm > 1) {
                    listScript.push({
                        command: "_showWildTransition",
                        data: {
                            name: "WildTransition",
                            content: {
                                matrix,
                                isNormal: true,
                                nwm,
                                isShowBigwin: showBigWin
                            }
                        }
                    });
                    listScript.push({
                        command: "_animMultiplierWild",
                        data: {
                            nwm,
                            isShowBigwin: showBigWin
                        }
                    });
                }
                listScript.push({
                    command: "_showCutscene",
                    data: {
                        name: "WinEffect",
                        content: {
                            winAmount: winAmount,
                            currentBetData
                        }
                    }
                });
                listScript.push({
                    command: "_addWinningAmount",
                    data: { winAmount, time: 300 }
                });
            } else {
                if (nwm && nwm > 1) {
                    listScript.push({
                        command: "_showAllPayLine",
                    });
                    listScript.push({
                        command: "_showWildTransition",
                        data: {
                            name: "WildTransition",
                            content: {
                                matrix,
                                isNormal: true,
                                nwm,
                                isShowBigwin: showBigWin
                            }
                        }
                    });
                    listScript.push({
                        command: "_animMultiplierWild",
                        data: {
                            nwm,
                            isShowBigwin: showBigWin
                        }
                    });
                } else {
                    listScript.push({
                        command: "_showAllPayLineSync",
                    });
                }
                if (winAmount && winAmount < currentBetData * 10) {
                    listScript.push({
                        command: "_showSoundWinAnimation",
                        data: {
                            currentBetData,
                            winAmount
                        }
                    });
                }
            }
            listScript.push({
                command: "_showEachPayLineSync",
            });


        }
        if (winAmountPlaySession) {
            listScript.push({
                command: "_addWinningAmount",
                data: { winAmount: winAmountPlaySession, time: 300 }
            });
        }

        listScript.push({
            command: "_playSFXLenChau",
        });
        listScript.push({
            command: "_showScatterPayLine",
        });

        listScript.push({
            command: "_showCutscene",
            data: {
                name: "ScatterTransition",
                content: {
                    matrix,
                    isNormal: true
                }
            }
        });
        listScript.push({
            command: "_playSFXCloud1",
        });
        listScript.push({
            command: "_showCutscene",
            data: {
                name: "CloudTransition",
                content: {}
            }
        });

        listScript.push({
            command: "_showFreeGameOption",
            data: {
                name: "FreeGameOption",
                content: {
                    mode: "normal"
                }
            }
        });
        listScript.push({
            command: "_newGameMode",
            data: { name: "freeGame", data: matrix },
        });
        listScript.push({
            command: "_resumeGameMode",
            data: { name: "normalGame", },
        });
        if (spinTimes && spinTimes > 0) {
            listScript.push({
                command: "_resumeSpinTime",
                data: spinTimes,
            });
        }

        if (payLines && payLines.length > 0) {
            listScript.push({
                command: "_showEachPayLine",
            });
        } else {
            listScript.push({
                command: "_clearPaylines",
            });
        }
        listScript.push({
            command: "_updateWallet",
        });
        listScript.push({
            command: "_gameRestart"
        });

    },

    scriptNormalGame(listScript) {
        const { payLines, winAmount, jpInfo, nwm, matrix } = this.node.gSlotDataStore.lastEvent;
        const winAmountPlaySession = this.node.gSlotDataStore.playSession.winAmount;
        const { currentBetData } = this.node.gSlotDataStore.slotBetDataStore.data;
        const { spinTimes, gameSpeed } = this.node.gSlotDataStore;
        const isFTR = gameSpeed === this.node.config.GAME_SPEED.INSTANTLY;

        if (spinTimes && spinTimes > 0) {
            listScript.push({
                command: "_resumeSpinTime",
                data: spinTimes,
            });
        }
        if (payLines && payLines.length > 0) {
            const showBigWin = winAmount && winAmount >= currentBetData * 10 && !jpInfo;
            if (showBigWin) {
                listScript.push({
                    command: "_showAllPayLine",
                });
                if (nwm && nwm > 1) {
                    listScript.push({
                        command: "_showWildTransition",
                        data: {
                            name: "WildTransition",
                            content: {
                                matrix,
                                isNormal: true,
                                nwm,
                                isShowBigwin: showBigWin
                            }
                        }
                    });
                    listScript.push({
                        command: "_animMultiplierWild",
                        data: {
                            nwm,
                            isShowBigwin: showBigWin
                        }
                    });
                    if (showBigWin && !this.node.gSlotDataStore.modeTurbo) {
                        listScript.push({
                            command: "_delayTimeScript",
                            data: 1.5
                        });
                    }
                }
                listScript.push({
                    command: "_showWinEffect",
                    data: {
                        name: "WinEffect",
                        content: {
                            winAmount: winAmount,
                            currentBetData
                        }
                    }
                });
                if (!this.node.gSlotDataStore.modeTurbo && !isFTR) {
                    listScript.push({
                        command: "_updateWinningAmountSync",
                        data: { winAmount: winAmountPlaySession, time: 300 }
                    });
                }
            } else {
                if (nwm && nwm > 1) {
                    listScript.push({
                        command: "_showAllPayLine",
                    });
                    listScript.push({
                        command: "_showWildTransition",
                        data: {
                            name: "WildTransition",
                            content: {
                                matrix,
                                isNormal: true,
                                nwm,
                                isShowBigwin: showBigWin
                            }
                        }
                    });
                    listScript.push({
                        command: "_animMultiplierWild",
                        data: {
                            nwm,
                            isShowBigwin: showBigWin
                        }
                    });
                } else {
                    listScript.push({
                        command: "_showAllPayLineSync",
                    });
                }
                if (winAmount && winAmount < currentBetData * 10) {
                    listScript.push({
                        command: "_showSoundWinAnimation",
                        data: {
                            currentBetData,
                            winAmount
                        }
                    });
                }
            }
            listScript.push({
                command: "_showEachPayLine",
            });
        } else {
            listScript.push({
                command: "_clearPaylines",
            });
        }
        if (winAmount > 0) {
            listScript.push({
                command: "_updateWinningAmountSync",
                data: { winAmount: winAmountPlaySession, time: isFTR ? 50 : 300 }
            });
        }
        listScript.push({
            command: "_pauseWallet",
        });
        listScript.push({
            command: "_gameRestart"
        });

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

    makeScriptSetUpBet(value) {
        return [{
            command: "_updateBet",
            data: value,
        }];
    },
});
