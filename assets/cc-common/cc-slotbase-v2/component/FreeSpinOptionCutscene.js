

const InfoScreen = require('InfoScreen');
cc.Class({
    extends: InfoScreen,

    properties: {
        overlayNode: cc.Node,
        contentNode: cc.Node,
        mainDirector: cc.Node,
        options: {
            type: cc.Node,
            default: []
        },
        displayDuration: 1,
        introFreeGame: cc.Node,
        waitingTimeToAutoSelect: 20,
    },

    onLoadExtended() {
        this._buttons = [];
        for (let i = 0; i < this.options.length; i++) {
            const button = this.options[i].getComponent(cc.Button);
            if (button) {
                this._buttons.push(button);
            }
        }
    },

    enter() {
        cc.log(`Enter Free Spin Option Cutscene`);
        this.enableAllButtons(true);
        for (let i = 0; i < this.options.length; i++) {
            this.options[i].off("click");
            this.options[i].on("click", () => {
                this.selectOption(i + 1);
            });
        }
        if (this.node.soundPlayer){
            this.node.soundPlayer.playMainBGM("freeSpinOption");
        }
        this._isOptionSelected = false;

        if(this._autoSelectOption!=null && this._autoSelectOption.target!=null){
            this.node.stopAction(this._autoSelectOption);
        }

        if(this.node.gSlotDataStore.isTrialMode == true){
            this._autoSelectOption = cc.sequence(cc.delayTime(0.2), cc.callFunc(()=>{
                this.selectOption(1);
            }));
        }else{
            this._autoSelectOption = cc.sequence(cc.delayTime(this.waitingTimeToAutoSelect), cc.callFunc(()=>{
                this.selectOption(2);
            }));
        }

        this.node.runAction(this._autoSelectOption);

        this.contentNode.opacity = 0;
        this.contentNode.scale = 0.01;
        this.overlayNode.opacity = 0;
    },

    show(){
        this._super();
        this.contentNode.opacity = 255;
        this.contentNode.scale = 1;
        this.overlayNode.opacity = 180;
    },

    enableAllButtons(isEnable, exceptionIndex = -1) {
        for (let i = 0; i < this._buttons.length; i++) {
            if (i != exceptionIndex) {
                this._buttons[i].interactable = isEnable;
            }
            this._buttons[i].node.scale = 1;
        }
    },

    selectOption(optionIndex) {
        if (this._isOptionSelected == false) {
            if (this.node.soundPlayer) {
                this.node.soundPlayer.stopAllAudio();
                this.node.soundPlayer.playSoundFreeSpinOptionClick();
            }
            this.node.runAction(cc.sequence(
                cc.delayTime(0.5),
                cc.callFunc(() => {
                    cc.log(`Send Free Spin Option Index: ${optionIndex}`);
                    this.mainDirector.getComponent('Director').gameStateManager.triggerFreeSpinOption(optionIndex);
                    for (let i = 0; i < this.options.length; i++) {
                        this.options[i].off("click");
                    }
                })));
            this._isOptionSelected = true;
            this.enableAllButtons(false, optionIndex - 1);
            if(this._autoSelectOption!=null && this._autoSelectOption.target!=null){
                this.node.stopAction(this._autoSelectOption);
            }
        }
    },

    resetNode() {
        if(this.instantly==true){
            this.contentNode.opacity = 0;
            this.overlayNode.opacity = 0;
        }else{
            this.contentNode.runAction(cc.fadeOut(0.5));
            this.overlayNode.runAction(cc.fadeOut(0.5));
        }

        this._isOptionSelected = false;
    },

    onDestroy() {
        this._buttons = [];
        if(this._autoSelectOption!=null && this._autoSelectOption.target!=null){
            this.node.stopAction(this._autoSelectOption);
        }
        this._autoSelectOption = null;
    },
});
