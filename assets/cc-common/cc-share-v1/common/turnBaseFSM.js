

const StateMachine = require('javascript-state-machine');

export default StateMachine.factory({     //  <-- the factory is constructed here
    init: 'bootingGame',
    transitions: [
        {
            name: 'gameStart',
            from: 'bootingGame',
            to: 'waitingAction'
        },
        {
            name: 'gameResume',
            from: '*',
            to: 'showingResult'
        },
        {
            name: 'actionTrigger',
            from: 'waitingAction',
            to: 'waitingResult'
        },
        {
            name: 'resultReceive',
            from: 'waitingResult',
            to: 'showingResult'
        },
        {
            name: 'gameRestart',
            from: 'showingResult',
            to: 'waitingAction'
        },
        {
            name: 'gameEnd',
            from: 'showingResult',
            to: 'closingGame'
        },
        {
            name: 'reboot',
            from: '*',
            to: 'bootingGame'
        },
    ],
    methods: {
        onInvalidTransition: function () {
            // cc.log("fsm: transition not allowed from that state", transition, from, to);
        },
        onPendingTransition: function () {
            // cc.log("fsm: transition already in progress", transition, from, to);
        },
        onTransition: function(lifecycle) {
            // cc.log("trigger: "+lifecycle.transition +", state change from "+ lifecycle.from +" to "+ lifecycle.to);
            if(this.GAME_MODE){
                cc.log(`%c ${this.GAME_MODE}:` +`%c run ${lifecycle.transition} =>`, 'color:blue;','color:red;', lifecycle.to);
            }
        },
    },
});
