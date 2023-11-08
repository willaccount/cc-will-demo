

cc.Class({
    extends: cc.Component,
    properties: {
        gamePrefab: cc.Prefab,
        parentNode: cc.Node,
    },
    onLoad() {
        this.loaded = false;

        this.parentNode.on('PLT_SHOW_SCORE', this.showScore);
        this.parentNode.on('PLT_WALLET_UPDATE', this.showWallet);
        this.parentNode.on('PLT_BLUR', this.blur);
        this.parentNode.on('PLT_FOCUS', this.focus);
        this.parentNode.on('PLT_SPIN_START', this.spinStart);
        
    },
    loadGame() {
        this.gameNode = cc.instantiate(this.gamePrefab);
    },
    spinStart(){
        cc.log("PLT_Start_Spin");
    },
    showScore(value){
        cc.log("PLT_Score:",value);
    },
    showWallet(value) {
        cc.log("PLT_Wallet:",value);
    },
    blur(){
        cc.log("PLT_Blur!");
    },
    focus() {
        cc.log("PLT_Focus!");
    },
    openGame(){
        if (!this.loaded) {
            this.gameNode.parent = this.parentNode;
            this.gameNode.active= true;
            this.gameNodeScript = this.gameNode.getChildByName('Scripts');
            this.gameNodeDimFocusControl = this.gameNode.getComponent('DimFocusControl');
            this.gameNodeScript.emit('CONNECT_GAME');
            this.loaded = true;
        } else {
            this.gameNodeScript.emit('OPEN_GAME');
            this.gameNodeDimFocusControl.focus && this.gameNodeDimFocusControl.focus();
        }
        
        return this.gameNode;
    },
    outGame(){
        if (this.loaded) {
            this.gameNodeScript.emit('OUT_GAME');
            this.parentNode.removeChild(this.gameNode);
            this.loaded = false;
        }
    },
    closeConnection() {
        const globalNetwork = require('globalNetwork');
        globalNetwork.triggerUserLogout();
    },
});
