cc.Class({
    extends: cc.Component,

    properties: {
        playTrialButton: cc.Node,
        playRealButton: cc.Node,
        displayRootNode: cc.Node,
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
        this.buttons = this.node.getComponentsInChildren(cc.Button);
        this.node.setPlayDemoMode = this.setPlayDemoMode.bind(this);
    },

    setPlayDemoMode() {
        this.playingDemo = true;
        if(this.playRealButton){
            this.playRealButton.active = false;
        }

        if(this.playTrialButton){
            this.playTrialButton.active = true;
        }
        this.onEnableButtons(false);
    },

    onPlayTrialButtonClicked(){
        if (this.playingDemo) return;
        if(this.playRealButton){
            this.playRealButton.active = true;
        }

        if(this.playTrialButton){
            this.playTrialButton.active = false;
        }

        if(this.displayRootNode){
            this.displayRootNode.active = true;
        }
    },

    onPlayRealButtonClicked(){
        if (this.playingDemo) return;
        cc.warn('Back To Real Mode');
        if(this.playTrialButton){
            this.playTrialButton.active = true;
        }

        if(this.playRealButton){
            this.playRealButton.active = false;
        }

        if(this.displayRootNode){
            this.displayRootNode.active = false;
        }
    },

    onEnableButtons(isOn){
        if (this.playingDemo) isOn = false;
        cc.log('_showTrialButtons', isOn);
        this.buttons.forEach(bt => {
            bt.interactable = isOn;
        });
    },
});
