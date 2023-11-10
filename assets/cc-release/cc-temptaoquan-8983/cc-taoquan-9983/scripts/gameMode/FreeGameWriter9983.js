const SlotGameWriter = require('SlotGameWriter');
cc.Class({
    extends: SlotGameWriter,

    makeScriptGameStart() {
        const listScript = [];
        const { winAmount } = this.node.gSlotDataStore.playSession;
        if (winAmount && winAmount > 0) {
            listScript.push({
                command: "_updateWinningAmount",
                data: { winAmount, time: 300 }
            });
        }
        listScript.push({
            command: "_gameStart",
        });
        return listScript;
    },

    makeScriptSpinClick() {
        let listScript = [];
        const { freeGameRemain } = this.node.gSlotDataStore.playSession;
        let availableSpinTimes = freeGameRemain - 1;
        this.node.gSlotDataStore.spinTimes = availableSpinTimes;
        listScript.push({
            command: "_clearPaylines",
        });
        listScript.push({
            command: "_updateSpinTimes",
            data: availableSpinTimes
        });
        listScript.push({
            command: "_updateLastWin",
            data: false,
        });
        listScript.push({
            command: "_sendSpinToNetwork",
        });
        listScript.push({
            command: "_spinClick"
        });
        return listScript;
    },

    makeScriptResultReceive() {
        const {matrix,fwm, type, fsoi,fSubSym1, fSubSym2,jpInfo} = this.node.gSlotDataStore.lastEvent;
        const { freeGameRemain } = this.node.gSlotDataStore.playSession;
        if (matrix) {
            matrix[0].unshift("1");
            matrix[4].unshift("1");
        }
        // to Hue: ma trận này nó trả 3 4 4 4 3 thì f2r tụi nó ko thể dừng cùng lúc với cùng speed
        // e đã khô máu cho ra ma trận 4 4 4 4 4, với 2 symbols ko liên quan trong game

        if(type == 'freeSpinOptionResult'){
            const listScript = [];
            this.node.gSlotDataStore.spinTimes = freeGameRemain;
            this.node.gSlotDataStore.fsoi = fsoi;
            listScript.push({
                command: "_updateWildType",
                data: fsoi
            });
            listScript.push({
                command: "_updateSpinTimes",
                data: freeGameRemain
            });
            listScript.push({
                command: "_hideCutscene",
                data: {
                    name: "FreeGameOption",
                }
            });
            return listScript;
        }else{
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
                data: {matrix,fwm,fSubSym1,fSubSym2}
            });
            listScript.push({
                command: "_showResult",
                data: matrix,
            });
            return listScript;

          
        }  
        
    },
    makeScriptShowResults() {
        const {
            matrix, winAmount, payLines, fsor, fwm, fsolr,jpInfo
        } = this.node.gSlotDataStore.lastEvent;
        const { freeGameRemain, extend, freeGameTotal } = this.node.gSlotDataStore.playSession;
        const { currentBetData } = this.node.gSlotDataStore.slotBetDataStore.data;
        const winAmountPlaySession = this.node.gSlotDataStore.playSession.winAmount;
        const { gameSpeed } = this.node.gSlotDataStore;
        const isFTR = gameSpeed === this.node.config.GAME_SPEED.INSTANTLY;
        const listScript = [];
        
        listScript.push({
            command: "_clearPaylines",
        });
        listScript.push({
            command: "_setUpPaylines",
            data: { matrix, payLines: payLines },
        });

        if(!jpInfo){
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
                command: "_resumeUpdateJP",
            });
            listScript.push({
                command: "_hideSubSymbolPayLine",
            });
        }


        if (payLines && payLines.length > 0) {
           
            const showBigWin = winAmount && winAmount >= currentBetData * 10 && !jpInfo ;
            if (showBigWin) {
                listScript.push({
                    command: "_showAllPayLine",
                });
                if(fwm){
                    listScript.push({
                        command: "_showWildTransition",
                        data: {
                            name: "WildTransition",
                            content: {
                                matrix,
                                fwm,
                                isNormal: false
                            }
                        }
                    });
                }
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
                listScript.push({
                    command: "_addWinningAmount",
                    data: { winAmount: winAmountPlaySession, time: isFTR ? 50 : 300 }
                });
            } else {

                if(fwm){
                    listScript.push({
                        command: "_showAllPayLine",
                    });
                    listScript.push({
                        command: "_showWildTransition",
                        data: {
                            name: "WildTransition",
                            content: {
                                matrix,
                                fwm,
                                isNormal: false
                            }
                        }
                    });
                }else{
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
                listScript.push({
                    command: "_addWinningAmount",
                    data: { winAmount: winAmountPlaySession, time: isFTR ? 50 : 300 }
                });
            }
            listScript.push({
                command: "_showEachPayLineSync",
            });
        }

        if(fsolr) {
            listScript.push({
                command: "_showScatterPayLine",
            });
            listScript.push({
                command: "_showCutscene",
                data: {
                    name: "ScatterTransition",
                    content: {
                        matrix,
                        isNormal: false
                    }
                }
            });
            if(!fsor){
                listScript.push({
                    command: "_updateOptionRemain",
                    data: 1,
                });
            } else{
                if(!freeGameRemain || freeGameRemain <= 0){
                    listScript.push({
                        command: "_updateOptionRemain",
                        data: fsor + 1,
                    });
                }else{
                    listScript.push({
                        command: "_updateOptionRemain",
                        data: fsor,
                    });
                }
              
            }

        }

        this.node.gSlotDataStore.spinTimes = freeGameRemain;
        listScript.push({
            command: "_updateSpinTimes",
            data: freeGameRemain
        });

        if (!freeGameRemain || freeGameRemain <= 0) {
            listScript.push({
                command: "_updateWinningAmount",
                data: { winAmount: winAmountPlaySession, time: isFTR ? 50 : 300 }
            });
            listScript.push({
                command: "_delayTimeScript",
                data: 1
            });
            listScript.push({
                command: "_clearPaylines",
            });
            if( extend && !extend.fgo ){
                listScript.push({
                    command: "_showCutscene",
                    data: {
                        name: "TotalWinDialog",
                        content: {
                            winAmount: winAmountPlaySession,
                            freeGameTotal
                        }
                    }
                });
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
            }

            if(extend && extend.fgo) {
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
                    command: "_updateOptionRemain",
                    data: fsor,
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
                    command: "_delayTimeScript",
                    data: 1
                });
                listScript.push({
                    command: "_gameRestart"
                });
            } else {
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