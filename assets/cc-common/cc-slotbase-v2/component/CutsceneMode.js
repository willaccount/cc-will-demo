

cc.Class({
    extends: cc.Component,
    onLoad() {
        this.node.on("PLAY",this.play,this);
        this.node.on("HIDE",this.exit,this);
        this.node.on("INIT", this.init, this);
        this.node.on("SKIP", this.skip, this);
        this.node.opacity = 0;
        this.node.active = false;
        this.node.fullDisplay = true;
    },
    init(mainDirector) {
        this.node.mainDirector = mainDirector;
    }, 
    play(content, callback) {
        this.content = content;
        this.callback = callback;
        this.show();
        this.enter();
    },
    show() {
        this.node.opacity = 255;
        this.node.active = true;
    },
    enter() {
        //Overwrite this when extends
    },
    skip(){
        
    },
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