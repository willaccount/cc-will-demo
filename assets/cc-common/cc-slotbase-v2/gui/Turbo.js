const lodash = require('lodash');

cc.Class({
    extends: cc.Component,

    properties: {
        button: cc.Node,
        mainDirector: cc.Node,
    },

    onLoad() {
        this.node.on("TOGGLE_TURBO",this.turboToggle,this);
        this.node.on("TURN_ON",this.turnOnTurbo,this);
        this.node.on("TURN_OFF",this.turnOffTurbo,this);
        if(this.mainDirector){
            this.node.mainDirector = this.mainDirector;
        }
        this.loadTurboConfig();
    },
    loadTurboConfig() {
        this.firstLoad = true;
        if (!this.node.config || !this.node.mainDirector) return;
        const gameId = this.node.config.GAME_ID;
        let turboValue = cc.sys.localStorage.getItem('turboValueWithGame');
        if (lodash.isEmpty(turboValue)) {
            const newObj = {};
            newObj[gameId] = false;
            cc.sys.localStorage.setItem('turboValueWithGame', JSON.stringify(newObj));
        } else {
            turboValue = JSON.parse(turboValue);
            if (turboValue[gameId]) {
                this.node.mainDirector.director.setModeTurbo(true);
                this.turnOnTurbo();
            } else {
                this.node.mainDirector.director.setModeTurbo(false);
                this.turnOffTurbo();
            }
        }
        this.firstLoad = false;
    },
    setValueTurboConfig(value) {
        if (!this.node.config) return;
        if (this.node.mainDirector && this.node.mainDirector.director && this.node.mainDirector.director.trialMode) return;

        const gameId = this.node.config.GAME_ID;
        let turboValue = cc.sys.localStorage.getItem('turboValueWithGame');
        if (lodash.isEmpty(turboValue)) {
            const newObj = {};
            newObj[gameId] = value;
            cc.sys.localStorage.setItem('turboValueWithGame', JSON.stringify(newObj));
        } else {
            turboValue = JSON.parse(turboValue);
            if (lodash.isEmpty(turboValue)) {
                const newObj = {};
                newObj[gameId] = value;
                cc.sys.localStorage.setItem('turboValueWithGame', JSON.stringify(newObj));
            } else {
                turboValue[gameId] = value;
                cc.sys.localStorage.setItem('turboValueWithGame', JSON.stringify(turboValue));
            }
        }
    },
    turboToggle() {
        if (this.node.soundPlayer && !this.firstLoad) {
            if (typeof this.node.soundPlayer.playSfxTurboClick === 'function') {
                this.node.soundPlayer.playSfxTurboClick();
            } else {
                this.node.soundPlayer.playSFXClick();
            }
        }
        const isCheck = this.button.getComponent(cc.Toggle).isChecked;
        this.setValueTurboConfig(isCheck);
        this.node.emit('TURBO_TOGGLE',isCheck);
    },

    turnOnTurbo() {
        this.button.getComponent(cc.Toggle).isChecked = true;
        this.node.emit('TURBO_TOGGLE', true);
    },

    turnOffTurbo() {
        this.button.getComponent(cc.Toggle).isChecked = false;
        this.node.emit('TURBO_TOGGLE', false);
    },
});
