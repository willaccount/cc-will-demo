const SlotGameWriter = require('SlotGameWriter');

cc.Class({
    extends: SlotGameWriter,

    makeScriptResultReceive() {
        const { matrix, jpInfo } = this.node.gSlotDataStore.lastEvent;

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

        const { winAmount: winAmountPlaySession, freeGameRemain, winJackpotAmount } = this.node.gSlotDataStore.playSession;
        const { fsor: freeSpinOption } = this.node.gSlotDataStore.playSession.extend;
        const { currentBetData } = this.node.gSlotDataStore.slotBetDataStore.data;
        const listScript = [];
        const isSessionEnded = !bonusGame && !freeGameRemain;
        const isBigwin = winAmount && winAmount >= currentBetData * 20 && !isJackpotWin;
        const isJackpotWin = winJackpotAmount && winJackpotAmount > 0;
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

        //TODO: jackpot
        if (isJackpotWin) {
            listScript.push({
                command: "_showJackpotPayLine",
                data: payLineJackPot,
            });
            listScript.push({
                command: "_showUnskippedCutscene",
                data: {
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
        else {
            if (isBigwin) {
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
            const { spinTimes } = this.node.gSlotDataStore;
            if (bonusGame && bonusGame > 0) {
                listScript.push({ command: '_updateLastWin', data: false });
                if (winAmount && winAmount > 0) {
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
                    data: { name: "bonusGame", },
                });
                listScript.push({
                    command: "_resumeGameMode",
                    data: { name: "normalGame", },
                });
                if (!freeGame && spinTimes && spinTimes > 0) {
                    listScript.push({
                        command: "_resumeSpinTime",
                        data: spinTimes,
                    });
                }
            }

            if ((freeSpinOption && freeSpinOption > 0) || (freeGame && freeGame > 0)) {
                const { spinTimes } = this.node.gSlotDataStore;
                listScript.push({
                    command: '_updateLastWin',
                    data: false
                });
                if (!bonusGame) {
                    if (winAmountPlaySession && winAmountPlaySession > 0) {
                        listScript.push({
                            command: '_updateWinningAmount',
                            data: { winAmount: winAmountPlaySession, time: 10 }
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
            }
            if (!isAutoSpin && !this.isFastResult) {
                // if (!isBigwin || !isSessionEnded || !modeTurbo) {
                //     this.isFastResult = true;
                //     listScript.push({
                //         command: "_gameRestart"
                //     });
                // }
            }
            if (payLines && payLines.length > 0) {
                if (!isBigwin) {
                    listScript.push({
                        command: "_blinkAllPaylines",
                    });
                }
                listScript.push({
                    command: "_showNormalPayline",
                });

                this.makeScriptShowWildMultiplier(listScript);
            }
            else {
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

        return listScript;
    },

    makeScriptShowWildMultiplier(listScript) {
        const { payLines, winAmount, jpInfo, nwm, matrix } = this.node.gSlotDataStore.lastEvent;
        const winAmountPlaySession = this.node.gSlotDataStore.playSession.winAmount;
        const { currentBetData } = this.node.gSlotDataStore.slotBetDataStore.data;
        const { spinTimes, gameSpeed } = this.node.gSlotDataStore;
        const isFTR = gameSpeed === this.node.config.GAME_SPEED.INSTANTLY;
        const showBigWin = winAmount && winAmount >= currentBetData * 10 && !jpInfo;

        if (showBigWin) {
            listScript.push({
                command: "_showAllPayLine",
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
