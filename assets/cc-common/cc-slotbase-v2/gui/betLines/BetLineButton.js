cc.Class({
    extends: cc.Component,

    properties: {
        betLineButton: cc.Node,
        activeButtons: {
            default: [],
            type: cc.SpriteFrame,
        }
    },

    onLoad() {
        this.node.on('SET_ACTIVE', this.setActiveButton, this);
        this.node.on('SET_INDEX', this.setIndex, this);
        this.node.on('SET_SOUND', this.setSound, this);
    },

    init(betLineManager){
        this.betLineManager = betLineManager;
    },

    setActiveButton(isActive) {
        this.isActive = isActive;
        this.betLineButton.color = isActive ? cc.Color.WHITE : new cc.Color(70, 78, 143);

        this.node.mainDirector && this.node.mainDirector.director && this.node.mainDirector.director.onIngameEvent("BET_LINE_CLICK");
    },

    enableButton(isEnable) {
        this.betLineButton.getComponent(cc.Button).interactable = isEnable;
    },

    setIndex(index = 1) {
        this.index = Number(index);
        this.betLineButton.getComponent(cc.Sprite).spriteFrame = this.activeButtons[this.index - 1];
    },

    setSound(soundPlayer) {
        this.soundPlayer = soundPlayer;
    },

    /** Toggle Active Payline **/
    onToggleActive() {
        if (this.soundPlayer) this.soundPlayer.playSFXClick();
        this.setActiveButton(!this.isActive);
        if(this.betLineManager){
            this.betLineManager.onBetLineChangedByButton();
        }
    },
});
