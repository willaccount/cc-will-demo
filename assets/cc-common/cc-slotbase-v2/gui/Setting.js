
/* global CC_DEBUG */
cc.Class({
    extends: cc.Component,
    properties: {
        BGMCheckBox: cc.Node,
        SFXCheckBox: cc.Node,
        btnBetHistory: cc.Button
    },
    onLoad() {
        this.node.on("TOGGLE_SFX", this.sfxToggle, this);
        this.node.on("TOGGLE_BGM", this.bgmToggle, this);
        this.node.on("INIT", this.init, this);
        this.node.on("ADD_TOGGLE_SWITCH_NETWORK", this.addToggleSwitchNetwork, this);
        this.initialized = false;
    },
    init() {
        //Its some weird sound with Toggle sound when init, so this.initialized is the work around
        this.BGMCheckBox.getComponent(cc.Toggle).isChecked = false;
        this.SFXCheckBox.getComponent(cc.Toggle).isChecked = false;

        if (this.node.soundPlayer && this.node.soundPlayer.isEnableBGM) {
            this.BGMCheckBox.getComponent(cc.Toggle).check();
            this.node.soundPlayer.playMainBGM();
        }
        if (this.node.soundPlayer && this.node.soundPlayer.isEnableSFX) {
            this.SFXCheckBox.getComponent(cc.Toggle).check();
        }
        this.initialized = true;
        if (!this.node.mainDirector) return;
        const director = this.node.mainDirector.director;
        if (director && director.playingDemo) {
            this.btnBetHistory && (this.btnBetHistory.interactable = false);
        }
    },

    sfxToggle() {
        if (this.node.soundPlayer && this.initialized) {
            this.node.soundPlayer.setEffectEnable(this.SFXCheckBox.getComponent(cc.Toggle).isChecked);
            this.node.soundPlayer.playSFXClick();
        }
    },

    bgmToggle() {
        if (this.node.soundPlayer && this.initialized) {
            this.node.soundPlayer.playSFXClick();
            this.node.soundPlayer.setBgmEnable(this.BGMCheckBox.getComponent(cc.Toggle).isChecked);
        }
    },

    addToggleSwitchNetwork(gameStateManager) {
        const loadConfigAsync = require('loadConfigAsync');
        const { IS_PRODUCTION } = loadConfigAsync.getConfig();
        if (!gameStateManager || IS_PRODUCTION || !CC_DEBUG) return;
        
        const compName = 'ClickAndShow';
        const extendCompName = compName + gameStateManager.serviceId;
        let panelComponent = this.node.getComponent('ClickAndShow');
        if (!panelComponent && this.node.getComponent(extendCompName)) {
            panelComponent = this.node.getComponent(extendCompName);
        }
        if (panelComponent && panelComponent.panel) {
            this.toggleNode = new cc.Node;
            this.toggleNode.addComponent(cc.Toggle);
            this.toggleNode.setContentSize(cc.size(80, 80));
            this.toggleNode.opacity = 0;

            panelComponent.panel.addChild(this.toggleNode);
            const labelNode = new cc.Node;
            labelNode.addComponent(cc.Label);
            labelNode.getComponent(cc.Label).string = 'SLOW NETWORK';
            labelNode.getComponent(cc.Label).fontSize = 18;
            this.toggleNode.addChild(labelNode);

            const toggleCom = this.toggleNode.getComponent(cc.Toggle);
            toggleCom.isChecked = false;
            this.toggleNode.position = cc.v2(540, 0);
            this.toggleNode.on('toggle', () => {
                this.toggleNode.opacity = toggleCom.isChecked ? 255 : 0;
                gameStateManager.onForceGetLatestedState(toggleCom.isChecked);
            }, this);
        }
    },

    onDestroy() {
        if (this.toggleNode) {
            this.toggleNode.off("toggle");
        }
    }
});