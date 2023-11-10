const { changeParent } = require("utils");
cc.Class({
    extends: require("GameModeBasic"),
    properties: {
        increaseBetBtn: cc.Node,
        reduceBetBtn: cc.Node,
        backToLobby: cc.Node,
        setting: cc.Node,
        jackpotNormalHolder: cc.Node,
        jackpotFreeHolder: cc.Node,
        jackpot: cc.Node,
        jackpotGrand: cc.Node,
        jackpotMajor: cc.Node,
        turbo: cc.Node,
        info: cc.Node,
        bet: cc.Node,
        wallet: cc.Node,
    },
    onLoad() {
        this._super();
        this.node.getWinAmount = this.getWinAmount.bind(this);

        this.node.on("SHOW_GUI_NORMAL_GAME_MODE", this.showNormalGame, this);
        this.node.on("SHOW_GUI_FREE_GAME_MODE", this.showFreeGame, this);
        this.node.on("BET_ENABLE", this.enableBet, this);
        this.node.on("BET_DISABLE", this.disableBet, this);
        this.jackpotGrand.storePos = this.jackpotGrand.position;
        this.jackpotMajor.storePos = this.jackpotMajor.position;
        this.jackpot.storePos = this.jackpot.position;
    },
    enableBet() {
        this.increaseBetBtn.getComponent(cc.Button).interactable = true;
        this.reduceBetBtn.getComponent(cc.Button).interactable = true;
    },
    disableBet() {
        this.reduceBetBtn.getComponent(cc.Button).interactable = false;
        this.increaseBetBtn.getComponent(cc.Button).interactable = false;
    },

    hideAll() {
        this.jackpotGrand.position = this.jackpotGrand.storePos;
        this.jackpotMajor.position = this.jackpotMajor.storePos;
        this.jackpot.position = this.jackpot.storePos;
        this.jackpot.scale = 1;
        this.backToLobby.active = false;
        this.setting.active = false;
        this.jackpot.active = false;
        this.winAmount.active = false;
        this.turbo.active = false;
        this.info.active = false;
        this.bet.active = false;
        this.wallet.active = false;
    },
    showNormalGame() {
        this.hideAll();
        this.node.emit('GAME_SHOW');
        this.node.active = true;
        this.node.opacity = 255;
        changeParent(this.jackpot, this.jackpotNormalHolder);
        this.jackpot.active = true;
        this.winAmount.active = true;
        this.turbo.active = true;
        this.info.active = true;
        this.bet.active = true;
        this.wallet.active = true;
        this.setting.active = true;
        this.backToLobby.active = true;
    },
    showFreeGame() {
        this.hideAll();
        this.node.emit('GAME_SHOW');
        this.node.active = true;
        this.node.opacity = 255;
        this.turbo.active = true;
        this.winAmount.active = true;
        this.setting.active = true;
        this.backToLobby.active = true;
        this.jackpot.active = true;
        changeParent(this.jackpot, this.jackpotFreeHolder);
        this.jackpot.scale = 0.9;
        this.jackpot.setPosition(-403, 312);
        this.jackpotMajor.setPosition(0, -100);
        this.jackpotGrand.setPosition(0, 0);
    },
});
