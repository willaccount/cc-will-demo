const BaseSlotGameDirector = require('SlotGameDirector');
cc.Class({
    extends: BaseSlotGameDirector,
    properties: {
        optionRemain: cc.Label,
        wildMultiplier: cc.Node,
    },

    extendInit() {
        this.table.active = false;
    },

    ready(data) {
        if (this.node.soundPlayer) this.node.soundPlayer.stopAllAudio();
        if (this.node.soundPlayer) this.node.soundPlayer.playMainBGM();
        const { fsoi } = this.node.gSlotDataStore;       
        this.table.active = true;
        if (data && data.matrix) {
            this.table.emit("CHANGE_MATRIX", { matrix: data.matrix });
        }
        if(data && data.fgoi) {
            this.updateWildType(data.fgoi);
        } else if(fsoi) {
            const fsoiArr = fsoi.split(';');
            this.updateWildType(fsoiArr[1]);
        }
        if(data && data.fsor) {
            this.updateOptionRemain(data.fsor);
        }
        if (data && data.fwm && data.fwm > 1 && data.fgoi) {
            this.wildMultiplier.emit('ACTIVE_FAST', data.fwm, data.fgoi);
        }
        this.buttons.emit('SPIN_SHOW');
        this.buttons.emit('SPIN_ENABLE');
        this.buttons.emit('STOP_AUTO_SPIN_HIDE');
        const { winAmount, freeGameRemain } = this.node.gSlotDataStore.playSession;
        if (!winAmount || (winAmount && winAmount == 0)) {
            this.winAmount.emit("RESET_NUMBER");
        }

        this.node.gSlotDataStore.isAutoSpin = true;
        this.spinTimes.emit("UPDATE_SPINTIMES", freeGameRemain);

        this.scheduleOnce(() => {
            this.runAction('SpinByTimes', freeGameRemain);
        }, 1);
    },

    _spinClick(script) {
        this._super(script);
        this.wildMultiplier.emit('HIDE');
    },

    _showSoundWinAnimation(script,data) {
        const {currentBetData, winAmount} = data;
        const {gameSpeed } = this.node.gSlotDataStore;
        const isFTR = gameSpeed === this.node.config.GAME_SPEED.INSTANTLY;
        if(data && this.node.soundPlayer && !isFTR){
            if(winAmount >= currentBetData * 5 && winAmount < currentBetData * 10 ){
                this.node.soundPlayer.playSFXWinLine(3);
            }else if (winAmount >= currentBetData && winAmount < currentBetData * 5 ){
                this.node.soundPlayer.playSFXWinLine(2);
            } else if(winAmount > 0  && winAmount < currentBetData){
                this.node.soundPlayer.playSFXWinLine(1);
            }
        }
        this.executeNextScript(script);
    },
    
    _sendSpinToNetwork(script) {
        this.node.mainDirector.enableCheckForever();
        this.node.mainDirector.gameStateManager.triggerFreeSpinRequest();
        this.executeNextScript(script);
    },

    _gameExit(script) {
        if (!this.fsm.can('gameRestart')) return;
        this.fsm.gameRestart();
        this.spinTimes.emit("RESET_SPINTIMES");
        this.buttons.emit('SPIN_SHOW');
        this.buttons.emit('SPIN_ENABLE');
        this.resetMode();
        this.node.exit(() => {
            this.executeNextScript(script);
        });
    },
    
    resetMode() {
        this.table.active = false;
        this.wildMultiplier.emit('HIDE');
    },

    _resumeGameMode(script, { name, data }) {
        if (this.node.mainDirector) {
            this.node.mainDirector.resumeGameMode({ name, data }, () => {
                if (this.node.soundPlayer) this.node.soundPlayer.stopAllAudio();
                if (this.node.soundPlayer) this.node.soundPlayer.playMainBGM();
                this.executeNextScript(script);
            });
        } else {
            cc.error('There is no main Director to resume game mode');
            this.executeNextScript(script);
        }
    },

    _showFreeGameOption(script, { name, content }) {
        if (this.node.mainDirector) {
            this.node.mainDirector.showCutscene(name, content, () => {
                this.executeNextScript(script);
            });
        } else {
            cc.error('There is no main Director to play cutscenes');
            this.executeNextScript(script);
        }
    },

    _hideCutscene(script, { name }) {
        if (this.node.mainDirector) {
            this.node.mainDirector.hideCutscene(name, () => {
                this.executeNextScript(script);
            });
        } else {
            cc.error('There is no main Director to play cutscenes');
            this.executeNextScript(script);
        }
    },

    updateOptionRemain(data) {
        if(data) {
            this.optionRemain.node.parent.active = true;
            this.optionRemain.string = '+'+data;
        } else {
            this.optionRemain.node.parent.active = false;
        }
    },

    _updateOptionRemain(script, data) {
        this.updateOptionRemain(data);
        this.executeNextScript(script);
    },

    _updateWildMultiplier(script, data) {
        const { fgoi } = this.node.gSlotDataStore.playSession.extend;
        if (this.node.soundPlayer) this.node.soundPlayer.playMultiplier(data.fwm);
        this.wildMultiplier.emit('ACTIVE_MULTIPLIER', data.fwm, fgoi, true, ()=>{
            this.executeNextScript(script);
        });
    },
    _updateWildMultiplier_2(script, data) {
        const { fgoi } = this.node.gSlotDataStore.playSession.extend;
        //if (this.node.soundPlayer) this.node.soundPlayer.playMultiplier(data);
        this.wildMultiplier.emit('ACTIVE_FAST', data.fwm, fgoi);
        this.executeNextScript(script);
    },

    _showWildTransition(script,{name,content}) {
        const { fgoi } = this.node.gSlotDataStore.playSession.extend;
        this.node.mainDirector.showCutscene(name, content, (isSkip) => {
            if (isSkip) {
                this.wildMultiplier.emit('ACTIVE_FAST', content.fwm, fgoi);
                this.executeNextScript(script);
            } else {
                if (this.node.soundPlayer) this.node.soundPlayer.playMultiplier(content.fwm);
                this.wildMultiplier.emit('ACTIVE_MULTIPLIER', content.fwm, fgoi, true, () => {
                    this.executeNextScript(script);
                });
            }
        });
    },

    _showWildTransition_2(script,{content}) {
        const { fgoi } = this.node.gSlotDataStore.playSession.extend;
        this.wildMultiplier.emit('ACTIVE_FAST', content.fwm, fgoi);
        this.executeNextScript(script);
    },

    _updateWildType(script, data) {
        const fsoiArr = data.split(';');
        this.updateWildType(fsoiArr[1]);
        this.executeNextScript(script);
    },

    updateWildType(type) {
        this.table.emit("SET_WILD_TYPE", type);
    },

    _showAllPayLine(script){
        this.table.emit("BLINK_ALL_NORMAL_PAYLINES",()=>{});
        this.executeNextScript(script);
    },

    _showAllPayLineSync(script){
        this.table.emit("BLINK_ALL_NORMAL_PAYLINES", ()=>{
            this.executeNextScript(script);
        });
    },

    _showEachPayLineSync(script) {
        this.table.emit("SHOW_ALL_NORMAL_PAYLINES");
        this.executeNextScript(script);
    },

    _showAllPayLine_2(script){
        this.executeNextScript(script);
    },

    _showAllPayLineSync_2(script){
        this.executeNextScript(script);
    },

    // _showEachPayLineSync_2(script) {
    //     this.table.emit("HIDE_PAYLINES");
    //     this.executeNextScript(script);
    // },

    _showSubSymbolPayLine(script,data) {
        if (!this.hasPayline) {
            this.executeNextScript(script);
            return;
        }
        this.table.emit("SHOW_SUB_SYMBOL_PAYLINE",data,() => {
            this.executeNextScript(script);
        });
    },

    _hideSubSymbolPayLine(script){
        this.table.emit("HIDE_SUB_SYMBOL_PAYLINE");
        this.executeNextScript(script);
    },

    _showSubSymbolPayLine_2(script) {
        this.executeNextScript(script);
    },
    _playSFXCloud2(script){
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXCloud2();
        this.executeNextScript(script);
    },
    _playSFXCloud2_2(script){
        this.executeNextScript(script);
    },

    skipAllEffects() {
        this.wildMultiplier.emit('SHOW_LAST_RESULT');
        this._super();
    },

    fastToResultClick() {
        this.skipAllEffects();
        this._super();
    },

    spinClick() {
        this.skipAllEffects();
        this._super();
    },

    _updateValueJP(script, data) {
        this.node.mainDirector.updateValueJackpot(data.isGrand, data.value);
        this.executeNextScript(script);
    },
});
