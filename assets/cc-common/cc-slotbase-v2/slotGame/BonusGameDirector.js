

const baseDirector = require('BaseDirectorV2');
const TurnBaseFSM = require('turnBaseFSM');

cc.Class({
    extends: baseDirector,

    onExtendedLoad() {
        this.node.on("GAME_UPDATE",this.stateUpdate,this);
        this.node.on("GAME_ENTER",this.enter,this);
        this.node.on("GAME_INIT",this.init,this);
    },

    init() {
        this.fsm = new TurnBaseFSM();
        this.extendInit();
    },
    extendInit(){
        //Add your overwrite code here!
    },
    enter() {
        this.fsm.gameStart();
        this.onGameEnter();
    },
    exit() {
        this.fsm.gameEnd();
        this.node.exit();
    },
    stateUpdate() {
        if (!this.fsm.can('resultReceive')) return;
        this.fsm.resultReceive();
        this.onGameUpdate();
        this.fsm.gameRestart();
    },
    sendBonusGameToNetwork(event, data) {
        if (!this.fsm.can('actionTrigger')) return;
        this.fsm.actionTrigger();
        this.node.mainDirector.gameStateManager.triggerMiniGame(data);
        this.onGameAction();
    },

    //Update these functions when extend from this
    onGameEnter() {},
    onGameUpdate() {},
    onGameAction() {},
});
