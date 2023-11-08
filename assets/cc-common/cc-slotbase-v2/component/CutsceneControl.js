

const {convertAssetArrayToObject} = require('utils');
cc.Class({
    extends: cc.Component,

    properties: {
        cutscenes: {
            type: cc.Node,
            default: []
        }
    },
    onLoad () {
        this.cutscenesList = convertAssetArrayToObject(this.cutscenes);
        this.node.on("PLAY_CUTSCENE",this.playCutScene,this);
        this.node.on("CLOSE_CUTSCENE",this.closeCutScene,this);
        this.node.on("SKIP_CUTSCENES", this.skipCutscenes, this);
        this.node.on("CLOSE_ALL_NOTICES", this.closeAllNotices, this);
    },
    playCutScene(name, contents, callback) {
        if (this.cutscenesList[name]) {
            this.cutscenesList[name].emit("PLAY",contents,() => {
                if (callback && typeof callback == "function") {
                    callback();
                }
            });
        } else {
            if (callback && typeof callback == "function") {
                callback();
            }
        } 
    },

    closeCutScene(name, callback) {
        if (this.cutscenesList[name]) {
            this.cutscenesList[name].emit("HIDE",() => {
                if (callback && typeof callback == "function") {
                    callback();
                }
            });
        } else {
            if (callback && typeof callback == "function") {
                callback();
            }
        } 
    },

    skipCutscenes(){
        for(let i = 0; i<this.cutscenes.length; i++){
            this.cutscenes[i].emit("SKIP");
        }
    },

    isDisplayDialog()
    {
        let dialogNode = this.node.getChildByName("DialogMessage");
        let bigWinNode = this.node.getChildByName("BigWinEffect");
        return (dialogNode && dialogNode.active || bigWinNode && bigWinNode.active); 
    },

    isDisplayCutscene(){
        let res = false;
        for(let i = 0; i<this.cutscenes.length; i++){
            const cutscene = this.cutscenes[i];
            if(cutscene && cutscene.active && cutscene.opacity === 255 && cutscene.fullDisplay){
                res = true;
                break;
            }
        }
        return res;
    },

    closeAllNotices(){
        for(let i = 0; i < this.node.children.length; i++){
            const cutscene = this.node.children[i];
            cutscene.emit("CLOSE_NOTICE");
        }
    },

    getDisplayCutscene() {
        let result = '';
        for(let i = 0; i<this.cutscenes.length; i++){
            const cutscene = this.cutscenes[i];
            if(cutscene && cutscene.active && cutscene.opacity === 255){
                result = cutscene.name;
                break;
            }
        }
        return result;
    }
});
