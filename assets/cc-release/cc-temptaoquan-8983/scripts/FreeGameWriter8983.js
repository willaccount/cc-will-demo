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
        
        if (type == "freeGame") {
            this.excuseScriptShowWildMultiplier(listScript);

            if (payLines && payLines.length > 0) {
                listScript.push({
                    command: "_blinkAllPaylines",
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

    excuseScriptShowWildMultiplier(listScript) {
        const { winAmount, jpInfo, nwm, matrix } = this.node.gSlotDataStore.lastEvent;
        const { currentBetData } = this.node.gSlotDataStore.slotBetDataStore.data;
        const { gameSpeed } = this.node.gSlotDataStore;
        const isFTR = gameSpeed === this.node.config.GAME_SPEED.INSTANTLY;
        const showBigWin = winAmount && winAmount >= currentBetData * 10 && !jpInfo;

        if (showBigWin) {
            listScript.push({
                command: "_showAllPayLines",
            });
            if (nwm && nwm > 1) {
                listScript.push({
                    command: "_showWildMultiplier",
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
            }
        }
        else {
            if (nwm && nwm > 1) {
                listScript.push({
                    command: "_showWildMultiplier",
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
            }
        }
        listScript.push({
            command: "_showEachPayLine",
        });
    },
});
