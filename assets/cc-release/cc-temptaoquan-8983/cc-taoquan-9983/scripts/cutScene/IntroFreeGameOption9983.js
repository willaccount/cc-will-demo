
const cutsceneMode = require('CutsceneMode');

cc.Class({
    extends: cutsceneMode,
    properties: {
      

    },

    onCompletedntroAnim(){
        this.exit();
    },
    speedUp(){
        this.animIntro.speed = 4;
    },
    enter() {
        cc.log("Cutscene contents: ",this.content);
        this.animIntro  = this.getComponent(cc.Animation).play('IntroFreeGameOption9983');
        this.animIntro.speed = 1;
    },   

});
