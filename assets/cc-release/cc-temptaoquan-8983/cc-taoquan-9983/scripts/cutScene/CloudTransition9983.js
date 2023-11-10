
const cutsceneMode = require('CutsceneMode');

cc.Class({
    extends: cutsceneMode,
    properties: {
      

    },

    exit() {
        if (this.callback && typeof this.callback == "function") {
            this.node.emit("STOP");
            this.callback();
        }
        this.node.runAction(
            cc.sequence(
                cc.delayTime(0.5),
                cc.callFunc(() => {
                    this.node.active = false;
                })
            )
        );
    },

    onCompletedntroAnim(){
        this.exit();
    },
    speedUp(){
        this.animIntro.speed = 4;
    },
    enter() {
        cc.log("Cutscene contents: ",this.content);
        this.animIntro  = this.getComponent(cc.Animation).play('CloudTransition9983');
        this.animIntro.speed = 1;
    },   

});
