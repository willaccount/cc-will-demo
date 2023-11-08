

cc.Class({
    extends: cc.Component,

    properties: {
        playTrialButton: cc.Node,
        playRealButton: cc.Node,
        buttonRoot: cc.Node,
        displayRootNode: cc.Node,
        buttonIsHideIfDisable: true,
    },

    onLoad (){
        if(this.playTrialButton){
            this.playTrialButton.active = true;
        }
        if(this.playRealButton){
            this.playRealButton.active = false;
        }

        if(this.displayRootNode){
            this.displayRootNode.active = false;
        }
        this.node.on("ENABLE_BUTTONS", this.onEnableButtons, this);
    },

    triggerTrialMode(){
        this.node.emit("TRIAL_TRIGGER");
    },

    onPlayTrialButtonClicked(){
        if(this.playRealButton){
            this.playRealButton.active = true;
        }

        if(this.playTrialButton){
            this.playTrialButton.active = false;
        }

        if(this.displayRootNode){
            this.displayRootNode.active = true;
        }

        this.triggerTrialMode();
    },

    onPlayRealButtonClicked(){
        if(this.playTrialButton){
            this.playTrialButton.active = true;
        }

        if(this.playRealButton){
            this.playRealButton.active = false;
        }

        if(this.displayRootNode){
            this.displayRootNode.active = false;
        }

        this.triggerTrialMode();

    },

    onEnableButtons(isOn){
        if(this.buttonIsHideIfDisable == true){
            if(this.buttonRoot){
                this.buttonRoot.active = isOn;
            }
        }else{
            if(this.playTrialButton){
                this.playTrialButton.getComponent(cc.Button).interactable = isOn;
            }
            if(this.playRealButton){
                this.playRealButton.getComponent(cc.Button).interactable = isOn;
            }
        }
    },
});
