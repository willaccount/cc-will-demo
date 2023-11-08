

const turnBaseFSM = require('turnBaseFSM');
const {getRandomInt} = require('utils');
const baseDirector = require('BaseDirectorV2');


cc.Class({
    extends: baseDirector,
    onExtendedLoad() {
        this.node.on("GAME_UPDATE",this.stateUpdate,this);
        this.node.on("GAME_RESUME",this.stateResume,this);
        this.node.on("GAME_ENTER",this.enter,this);
        this.node.on("GAME_INIT",this.init,this);
        this.node.on("UPDATE_WINAMOUNT", this.setWinAmount, this);
    },
    init() {
        this.controls = {
            table: this.node.getChildByName('TableMiniGame'),
            tableComponent: this.node.getChildByName('TableMiniGame').mainComponent,
            winRate: this.node.getChildByName('MoneyFrame').getChildByName('Rate').getComponent(cc.Label),
        };
        
        this.fsm = new turnBaseFSM();
        this.timerCount = 15*1000;
    },
    stateUpdate() {
        this.miniGameResultReceive();
    },
    stateResume() {
        this.miniGameResultReceive();
    },

    enter(data) {
        if (!data) {
            data = [
                [0,0,0,0,0],
                [0,0,0,0,0],
                [0,0,0,0,0],
            ];
        }

        this.data = data;
        this.countMiniGame = 0;
        this.currentWinRate = 0;
        this.count = 0;
        this.fsm.gameStart();
        this.listClickedMiniGame = [];
        this.setTriggerMiniGame({timer: this.timerCount});
        // this.soundManager.stopBGAudio();
        // //waiting for 2s before play a sound bg for mini game.
        // setTimeout(() => {
        //     this.soundManager.playBGMiniGame();
        // }, 2000);
        
        this.runAnimationEnter();
    },

    runAnimationEnter() {
        const {tableComponent, winRate,} = this.controls;

        winRate.string = '0';
        tableComponent.createMiniGame(this.data, this.miniGameClick.bind(this));

        //Resume
        for (let i = 0; i < this.data.length; i++) {
            const row = this.data[i];
            for (let j = 0; j < row.length; j++) {
                if (row[j] > 0) this.miniGameOpenWhenResume(i+1, j+1, row[j]);
            }
        }
    },

    exit() {
        const {tableComponent, winRate,} = this.controls;
        this.currentWinRate = 0;
       
        winRate.string = '0';
        tableComponent.removeAllNode();
        this.listClickedMiniGame = [];
        clearTimeout(this.timeoutTriggerMiniGame);

        // this.soundManager.playBGAudio();

        this.node.exit();
    },
    setWinAmount({winAmount})
    {
        if (this.winAmount)
            this.winAmount.getComponent('TextControl').updateValue({value: winAmount, time: 0});
    },
    openBoxItemMiniGame(dataForMiniGame){
        this.count++;
        dataForMiniGame['count'] = this.count;
        const {tableComponent} = this.controls;
        tableComponent.rewriteSprite(dataForMiniGame, () => {
            this.updateWinRate(dataForMiniGame.bonus);
        });
    },

    setTriggerMiniGame({timer}) {
        const row = getRandomInt(1, 3);
        const col = getRandomInt(1, 5);
        if (this.listClickedMiniGame.includes(row + '' + col)) {
            this.setTriggerMiniGame({timer});
        } else {
            this.timeoutTriggerMiniGame = setTimeout(() => {
                this.miniGameClick({row, col}, true);
            }, timer);
        }
    },
    
    miniGameResultReceive() {
        if (!this.fsm.can('resultReceive')) return;
        
        const {bonusPlayRemain} = this.node.gSlotDataStore.playSession;
        const {miniResult} = this.node.gSlotDataStore.lastEvent;
        let bonus = 100;
        if (miniResult == "B") {
            bonus = 200;
        } else if (miniResult == "C") {
            bonus = 400;
        }

        this.fsm.resultReceive();
        /// show animation open treasure
        this.count++;
        const dataForMiniGame = {
            node: this.miniGamePost,
            bonus: bonus,
            count: this.count
        };
        const {tableComponent} = this.controls;

        const {node: {row, col}} = dataForMiniGame;
        const clickedMiniGame = tableComponent.getCurrentNode({node: {row, col}});
        clickedMiniGame.stopAllActions();
        tableComponent.rewriteSprite(dataForMiniGame);
        this.data[row - 1][col -1] = dataForMiniGame.bonus;
        this.fsm.gameRestart();
        this.setTriggerMiniGame({ timer: this.timerCount - 5000 });
        
        this.updateWinRate(dataForMiniGame.bonus || 0);
        //play sound when open cell.
        //param = bonus
        // this.soundManager.playMiniGameOpenCell(dataForMiniGame.bonus);

        if (!bonusPlayRemain || bonusPlayRemain <= 0) {
            cc.director.getScheduler().schedule(function(){
                this.exit();
            }, this, 0, 0, 2, false);
        }
    },
    miniGameClick(dataUpdate, isAutoTrigger = false) {
        const {
            row, col
        } = dataUpdate;
        const openCell = (row - 1) * 5 + col - 1;

        if (this.fsm.can('actionTrigger') && this.countMiniGame < 3 && this.data[row - 1][col -1] == '0') {
            this.countMiniGame++;
            this.fsm.actionTrigger();
            this.miniGamePost = dataUpdate;
            // store command id to data store
            const {tableComponent} = this.controls;
            
            //sharing cell
            const clickedMiniGame = tableComponent.getCurrentNode({ node: { row, col } });
            this.runAnimation(clickedMiniGame);
            
            this.listClickedMiniGame.push(row + '' + col);
            this.node.mainDirector.gameStateManager.triggerMiniGame(openCell);
            if (!isAutoTrigger) {
                clearTimeout(this.timeoutTriggerMiniGame);
            }
        }
    },
    miniGameOpenWhenResume(row, col, bonus) {
        this.countMiniGame++;
        const dataForMiniGame = {
            node: {row: row, col: col},
            bonus: bonus,
        };
        this.openBoxItemMiniGame(dataForMiniGame);
        this.listClickedMiniGame.push(row + '' + col);
    },

    runAnimation(clickedMiniGame) {
        const repeater = cc.repeatForever(cc.sequence(
            cc.moveTo(0.02, cc.v2(clickedMiniGame.x - 10, clickedMiniGame.y)),
            cc.moveTo(0.02, cc.v2(clickedMiniGame.x, clickedMiniGame.y)),
            cc.moveTo(0.02, cc.v2(clickedMiniGame.x + 10, clickedMiniGame.y)),
            cc.moveTo(0.02, cc.v2(clickedMiniGame.x, clickedMiniGame.y)),
        ));
        clickedMiniGame.runAction(repeater);
    },
    updateWinRate(value) {
        const {winRate} = this.controls;
        if (value) {
            this.currentWinRate += Number(value);
            winRate.string = `X${this.currentWinRate}`;
        }
    },

    forceStopSpinning() {
        
    },

    stopAutoSpinClick() {
        
    }

    // update (dt) {},
});
