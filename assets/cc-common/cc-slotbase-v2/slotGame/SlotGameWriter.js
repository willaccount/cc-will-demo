

const { findKeyByValue, floatUtils } = require('utils');
cc.Class({
    extends: cc.Component,
    onLoad() {
        this.node.writer = this;
    },
    makeScriptResume() {
        const {
            normalGameTableFormat, bonusGameMatrix, normalGameMatrix, normalGamePayLines, bonusGameRemain, freeGameRemain,
            freeGameMatrix, winAmount, betId, freeGameTableFormat, currentBonusCredits, isFinished
        } = this.node.gSlotDataStore.playSession;
        const {fsor: freeSpinOption} = this.node.gSlotDataStore.playSession.extend;
        const normalSpinMatrix = this.node.gSlotDataStore.convertSlotMatrix(normalGameMatrix, normalGameTableFormat);
        const normalPayLines = this.node.gSlotDataStore.convertPayLine(normalGamePayLines);
        const {steps} = this.node.gSlotDataStore.slotBetDataStore.data;
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
            data: {matrix: normalSpinMatrix},
        });
        listScript.push({
            command: "_setUpPaylines",
            data: {matrix: normalSpinMatrix, payLines: normalPayLines},
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
                data: {winAmount: updatedWinAmount, time: 0}
            });
        }
        if (isBonusGameInNormal) {
            listScript.push({
                command: "_showBonusPayLine",
            });
            listScript.push({
                command: "_newGameMode",
                data: {
                    name: "bonusGame",
                    data: bonusGameMatrix
                },
            });
            listScript.push({
                command: "_resumeGameMode",
                data: {name: "normalGame",},
            });
        }
        if (freeSpinOption && freeSpinOption > 0) {
            listScript.push({
                command: "_showScatterPayLine",
            });
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
            listScript.push({
                command: "_showScatterPayLine",
            });
            if (isBonusGameInFree)
            {
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
                    data: {name: "freeGame", data: freeSpinMatrix,},
                });
            listScript.push({
                command: "_resumeGameMode",
                data: {name: "normalGame",},
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

        if(promotion === true && promotionRemain && promotionTotal && promotionRemain >0) {
            listScript.push({
                command: "_showPromotionPopup",
            });
        }

        return listScript;
    },

    makeScriptUpdateWalletData(wallet) {
        const listScript = [];
        const {wallet: currentWallet} = this.node.gSlotDataStore.slotBetDataStore.data;
        if (!floatUtils.isEqual(currentWallet, wallet)) {
            listScript.push({
                command: "_updateWallet",
            });
            this.node.gSlotDataStore.slotBetDataStore.updateWallet(wallet);
        }
        return listScript;
    },

    makeScriptGameStart() {
        const listScript = [];

        listScript.push({
            command: "_gameStart",
        });
        return listScript;
    },

    makeScriptSwitchMode() {
        this.node.gSlotDataStore.playSession.winAmount = 0;
        const listScript = [];
        listScript.push({
            command: "_forceToClearPaylines"
        });
        listScript.push({
            command: "_updateLastWin",
            data: false
        });
        listScript.push({
            command: "_clearWinAmount",
        });
        listScript.push({
            command: "_updateJackpot",
        });
        return listScript;
    },

    makeScriptSpinClick() {
        let listScript = [];
        const {currentBetData, steps, currentExtraBetData, extraSteps} = this.node.gSlotDataStore.slotBetDataStore.data;
        const betIndex = findKeyByValue(steps,currentBetData);
        const extraBetIndex = findKeyByValue(extraSteps,currentExtraBetData);
        const {spinTimes, isAutoSpin, promotion, promotionBetId, promotionRemain} = this.node.gSlotDataStore;
        const {freeGameRemain, winAmount} = this.node.gSlotDataStore.playSession;
        let availableSpinTimes = '';
        const totalBetAmount = this._getTotalBetAmount();

        if (freeGameRemain && freeGameRemain > 0) {
            availableSpinTimes = freeGameRemain - 1;
        }else if (promotion && promotionRemain > 0) {
            availableSpinTimes = promotionRemain - 1;
            listScript.push({
                command: "_updatePromotionRemain",
                data: availableSpinTimes
            });
        }
        else if (isAutoSpin) {
            if (spinTimes && spinTimes > 0) {
                availableSpinTimes = spinTimes - 1;
            }
        } else {
            availableSpinTimes = 0;
        }
        this.node.gSlotDataStore.spinTimes = availableSpinTimes;

        const canISpin = this.node.gSlotDataStore.slotBetDataStore.calculateWalletAfterClickSpin(totalBetAmount);
        listScript.push({
            command: "_showTrialButtons",
            data: false
        });
        if (this.node.mainDirector.trialMode) {
            if (this._canSpinTrial()) {
                if (winAmount > 0 && (!freeGameRemain || freeGameRemain <= 0) && !promotion) {
                    listScript.push({
                        command: "_updateLastWin",
                        data: true
                    });
                }
                if (!freeGameRemain)
                    listScript.push({
                        command: '_clearWinAmount'
                    });
                listScript.push({
                    command: "_clearPaylines",
                });
                listScript.push({
                    command: "_updateSpinTimes",
                    data: availableSpinTimes
                });
                if (!freeGameRemain) {
                    listScript.push({
                        command: "_updateWalletOnTrialSpinClick",
                    });
                }
                if (!promotion) {
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
                this.node.gSlotDataStore.isAutoSpin = false;
                listScript = [
                    {
                        command: "_enableBet",
                    },
                    {
                        command: "_clearPaylines",
                    },
                    {
                        command: '_resetSpinButton'
                    },
                    {
                        command: "_showTrialButtons",
                        data: true
                    },
                    {
                        command: "_showMessageNoMoney",
                    },
                ];
                return listScript;
            }
        } else if (canISpin >= 0 || freeGameRemain > 0 || promotion === true) {
            if (canISpin >= 0 && !promotion && !freeGameRemain) {
                this.node.gSlotDataStore.slotBetDataStore.updateWalletAfterClickSpin(totalBetAmount);
            }
            listScript.push({
                command: '_disableBet'
            });
            if (winAmount > 0 && (!freeGameRemain || freeGameRemain <= 0)) {
                listScript.push({
                    command: '_updateLastWin',
                    data: true
                });
            }
            listScript.push({
                command: "_clearPaylines"
            });
            if (!freeGameRemain)
                listScript.push({
                    command: '_clearWinAmount'
                });
            listScript.push({
                command: "_updateSpinTimes",
                data: availableSpinTimes
            });
            if(!freeGameRemain) {
                listScript.push({
                    command: "_updateWallet",
                });
            }
            if (promotion) {
                listScript.push({
                    command: "_sendSpinToNetwork",
                    data: {currentBetData: promotionBetId}
                });
            } else {
                listScript.push({
                    command: "_sendSpinToNetwork",
                    data: {currentBetData: betIndex + "" + extraBetIndex}
                });
            }
            listScript.push({
                command: "_spinClick"
            });
        } else {
            this.node.gSlotDataStore.spinTimes = 0;
            this.node.gSlotDataStore.isAutoSpin = false;
            listScript = [
                {
                    command: "_enableBet",
                },
                {
                    command: "_clearPaylines",
                },
                {
                    command: '_resetSpinButton'
                },
                {
                    command: "_showTrialButtons",
                    data: true
                },
                {
                    command: "_showMessageNoMoney",
                },
            ];
        }
        return listScript;
    },
    makeScriptResultReceive() {
        const {matrix, jpInfo} = this.node.gSlotDataStore.lastEvent;

        let listScript = [];

        if (jpInfo) {
            listScript.push({
                command: "_pauseUpdateJP"
            });
        }
        
        listScript.push({
            command: "_resultReceive",
            data: matrix,
        });

        listScript.push({
            command: "_showResult",
            data: matrix,
        });

        return listScript;
    },
    makeScriptShowResults() {
        const {
            type, matrix, winAmount, payLines, payLineJackPot,
            bonusGame, freeGame
        } = this.node.gSlotDataStore.lastEvent;

        const {winAmount: winAmountPlaySession, freeGameRemain, winJackpotAmount} = this.node.gSlotDataStore.playSession;
        const {fsor: freeSpinOption} = this.node.gSlotDataStore.playSession.extend;
        const {currentBetData} = this.node.gSlotDataStore.slotBetDataStore.data;
        const listScript = [];
        const isSessionEnded = !bonusGame && !freeGameRemain;
        const isBigwin = winAmount && winAmount >= currentBetData * 20 && !isJackpotWin;
        const isJackpotWin = winJackpotAmount && winJackpotAmount > 0;
        const { isAutoSpin, modeTurbo } = this.node.gSlotDataStore;
        this.isFastResult = false;

        if (type != 'freeGameOptionResult') {
            listScript.push({
                command: "_setUpPaylines",
                data: {matrix, payLines},
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

        //TODO: jackpot
        if (isJackpotWin) {
            listScript.push({
                command: "_showJackpotPayLine",
                data: payLineJackPot,
            });
            listScript.push({
                command: "_showUnskippedCutscene",
                data:{
                    name: "JackpotWin",
                    content: {
                        winAmount: winJackpotAmount,
                        currentBetData
                    }
                }
            });
            listScript.push({
                command: "_resumeUpdateJP",
            });
        }
        else
        {
            if (isBigwin)
            {
                if (isSessionEnded && modeTurbo && !isAutoSpin && !this.isFastResult) {
                    this.isFastResult = true;
                    listScript.push({
                        command: "_gameRestart"
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
        }

        if (type == "normalGame") {
            const {spinTimes} = this.node.gSlotDataStore;
            if (bonusGame && bonusGame > 0) {
                listScript.push({command: '_updateLastWin', data:false});
                if (winAmount && winAmount > 0)
                {
                    listScript.push({
                        command: '_updateWinningAmount',
                        data: {
                            winAmount: winAmountPlaySession,
                            time: 300
                        }
                    });
                } else {
                    listScript.push({
                        command: '_clearWinAmount'
                    });
                }
                listScript.push({
                    command: "_showBonusPayLine",
                });
                listScript.push({
                    command: "_newGameMode",
                    data: {name: "bonusGame",},
                });
                listScript.push({
                    command: "_resumeGameMode",
                    data: {name: "normalGame",},
                });
                if (!freeGame && spinTimes && spinTimes > 0) {
                    listScript.push({
                        command: "_resumeSpinTime",
                        data: spinTimes,
                    });
                }
            }
            
            if ((freeSpinOption && freeSpinOption > 0) || (freeGame && freeGame > 0)) {
                const {spinTimes} = this.node.gSlotDataStore;
                listScript.push({
                    command: '_updateLastWin',
                    data: false
                });
                if (!bonusGame) {
                    if (winAmountPlaySession && winAmountPlaySession > 0) {
                        listScript.push({
                            command: '_updateWinningAmount',
                            data: {winAmount: winAmountPlaySession, time: 10}
                        });
                    } else {
                        listScript.push({
                            command: '_clearWinAmount'
                        });
                    }
                }
                listScript.push({
                    command: "_showScatterPayLine",
                });
                if (freeSpinOption && freeSpinOption > 0) {
                    listScript.push({
                        command: "_showCutscene",
                        data: {
                            name: "FreeGameOption"
                        }
                    });
                }
                listScript.push({
                    command: "_newGameMode",
                    data: {name: "freeGame", data: matrix},
                });
                listScript.push({
                    command: "_resumeGameMode",
                    data: {name: "normalGame",},
                });

                if (spinTimes && spinTimes > 0) {
                    listScript.push({
                        command: "_resumeSpinTime",
                        data: spinTimes,
                    });
                }
            }
            if (!isAutoSpin && !this.isFastResult) {
                if (!isBigwin || !isSessionEnded || !modeTurbo) {
                    this.isFastResult = true;
                    listScript.push({
                        command: "_gameRestart"
                    });
                }
            }
            if (payLines && payLines.length > 0)
            {
                if (!isBigwin)
                {
                    listScript.push({
                        command: "_blinkAllPaylines",
                    });
                }
                listScript.push({
                    command: "_showNormalPayline",
                });
            }
            else
            {
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
            if (!this.isFastResult) {
                listScript.push({
                    command: "_gameRestart"
                });
            }
        }
        else
        if (type == "freeGame") {
            if (bonusGame && bonusGame > 0) {
                if (winAmount && winAmount > 0)
                {
                    listScript.push({
                        command: '_updateWinningAmount',
                        data: {
                            winAmount: winAmountPlaySession,
                            time: 300
                        }
                    });
                }
                listScript.push({
                    command: "_showBonusPayLine",
                });
                listScript.push({
                    command: "_newGameMode",
                    data: {name: "bonusGame",},
                });
                listScript.push({
                    command: "_resumeGameMode",
                    data: {name: "freeGame",},
                });
            }

            if (payLines && payLines.length > 0) {
                listScript.push({
                    command: "_blinkAllPaylines",
                });
                listScript.push({
                    command: "_showFreePayline",
                });
            }
            else
            {
                listScript.push({
                    command: "_clearPaylines",
                });
            }
            listScript.push({
                command: "_gameEnd"
            });

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
                    command: "_gameExit",
                });
            } else {
                listScript.push({
                    command: "_gameRestart"
                });
            }
        }

        return listScript;
    },

    makeScriptGameEnd() {
        return [];
    },
    makeScriptGameFinish() {
        const {winAmount} = this.node.gSlotDataStore.playSession;
        const listScript = [];

        if(this.node.mainDirector.trialMode && winAmount){
            listScript.push({
                command: '_updateTrialWallet',
                data: winAmount,
            });
        }

        return listScript;
    },

    makeScriptSetUpBet(value) {
        return [{
            command: "_updateBet",
            data: value,
        }];
    },

    scriptUpdateWinAmount(listScript) {
        const {winAmount: winAmountPlaySession} = this.node.gSlotDataStore.playSession;
        const {winAmount} = this.node.gSlotDataStore.lastEvent;
        if (winAmount && winAmount > 0)
        {
            if (winAmountPlaySession == winAmount)
            {
                listScript.push({
                    command: "_clearWinAmount"
                });
                listScript.push({
                    command: "_updateLastWin",
                    data: false
                });
            }
            listScript.push({
                command: "_updateWinningAmount",
                data: {winAmount: winAmountPlaySession, time: 300}
            });
        }
    },

    makeScriptGameRestart() {
        const listScript = [];
        const {freeGameRemain} = this.node.gSlotDataStore.playSession;
        const {spinTimes, promotion, promotionRemain} = this.node.gSlotDataStore;

        this.scriptUpdateWinAmount(listScript);
        if (promotion && promotion > 0) {
            listScript.push({
                command: "_showTrialButtons",
                data: false,
            });
            listScript.push({
                command: "_resetPromotionButtons"
            });
        }

        if (spinTimes && spinTimes > 0) {
            if(freeGameRemain && freeGameRemain > 0){
                listScript.push({
                    command: "_runAutoSpin"
                });
            }else if(!promotion){
                listScript.push({
                    command: "_runAutoSpin"
                });
            }
        } else {
            if (!promotionRemain || promotionRemain <= 0) {
                listScript.push({
                    command: '_enableBet'
                });
                listScript.push({
                    command: "_exitPromotionMode"
                });
                listScript.push({
                    command: "_showTrialButtons",
                    data: true
                });
            }

        }
        return listScript;
    },

    //AUTO SPINS
    makeScriptSpinByTimes(times) {
        this.node.gSlotDataStore.isAutoSpin = true;
        this.node.gSlotDataStore.spinTimes = times;
        return [
            {
                command: "_runAutoSpin",
            },
        ];
    },
    makeScriptDisableAutoSpin() {
        this.node.gSlotDataStore.isAutoSpin = false;
        this.node.gSlotDataStore.spinTimes = 0;
        const listScript = [];
        listScript.push({
            command: "_updateSpinTimes",
            data: 0
        });
        return listScript;
    },
    _canSpinTrial() {
        const { freeGameRemain } = this.node.gSlotDataStore.playSession;
        if (freeGameRemain) return true;
        if (!this.node.gSlotDataStore.isPlayDemo) return true;
        const { trialWallet } = this.node.gSlotDataStore;
        const totalBet = this._getTotalBetAmount();
        return (trialWallet >= totalBet);
    },
    _getTotalBetAmount() {
        const { displayingBetData, currentExtraBetData, currentBetData } = this.node.gSlotDataStore.slotBetDataStore.data;
        if (displayingBetData) return displayingBetData;
        if (currentExtraBetData && currentBetData) return currentExtraBetData * currentBetData;
        if (currentBetData) return currentBetData;
        return 0;
    },
});
