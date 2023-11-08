
cc.Class({
    extends: require('CutsceneMode'),

    properties: {
        options: cc.Node,
    },

    onLoad() {
        this._super();
        this.director = this.node.mainDirector.getComponent('Director');
        this.node.opacity = 0;
    },

    //enable option when open
    enter() {
        this.options.children.forEach((item) => {
            item.getComponent(cc.Button).interactable = true;
            item.opacity = 255;
        });
    },

    //disable option when close
    optionClick(ev, index) {
        this.options.children.forEach((item, i) => {
            item.getComponent(cc.Button).interactable = false;
            if (i != index) {
                item.opacity = 150;
            }
            else {
                this.director.currentGameMode.director.freeSpinOptionTrigger(i);
                item.opacity = 255;
            }
        });
    },

    //play anim if any before close
    exit() {
        if (this.callback && typeof this.callback == "function") {
            if(this.node.mainDirector){
                this.node.mainDirector.onIngameEvent("ON_CUTSCENE_CLOSE", this.node.name);
            }
            this.node.emit("STOP");
            this.callback();
        }
        this.node.active = false;
    }
});
