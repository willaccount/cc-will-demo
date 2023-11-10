cc.Class({
    extends: cc.Component,

    properties: {
        animationName: 'winEff9983'
    },

    onLoad () {
        this.node.controller = this;
        let anim = this.node.getComponent(cc.Animation);
        anim.play(this.animationName);
        this.node.opacity = 0;
    },


    playEffect(){
        this.node.opacity = 255;
    },

    stopEffect(){
        this.node.opacity = 0;
    },
});
