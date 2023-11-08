

cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad() {
        this.node.init = this.init.bind(this);
        this.node.enter = this.enter.bind(this);
        this.node.exit = this.exit.bind(this);
        this.node.hide = this.hide.bind(this);
        this.node.show = this.show.bind(this);
        this.node.reset = this.reset.bind(this);
        this.node.stateUpdate = this.stateUpdate.bind(this);
        this.node.stateResume = this.stateResume.bind(this);
        this.node.resetCallbackWhenHide = this.resetCallbackWhenHide.bind(this);
    },
    init(mainDirector, isActive = false) {
        this.node.mainDirector = mainDirector;
        this.node.emit('GAME_INIT');
        this.node.opacity = 0;
        this.node.active = false;
        if(isActive){
            this.node.opacity = 255;
            this.node.active = true;
        }
    },
    stateResume(callback) {
        this.node.emit('GAME_RESUME');

        if (callback && typeof callback == "function") {
            callback();
        }
    },
    stateUpdate(callback) {
        this.node.emit('GAME_UPDATE');

        if (callback && typeof callback == "function") {
            callback();
        }
    },
    //Show have callback to transition other mode out
    show(callback) {
        this.node.opacity = 255;
        this.node.emit('GAME_SHOW');
        if (callback && typeof callback == "function") {
            callback();
        }
    },
    exit () {
        if (this.callBackWhenHide && typeof this.callBackWhenHide == "function") {
            this.callBackWhenHide();
            this.callBackWhenHide = null;
        }
        this.hide();
        this.node.emit('GAME_EXIT');
        this.node.active = false;
    },
    hide(callback) {
        this.node.opacity = 0;
        this.node.emit('GAME_HIDE');
        if (callback && typeof callback == "function") {
            callback();
        }
    },
    enter(data, callback) {
        this.node.active = true;
        this.show();
        this.callBackWhenHide = callback;
        this.node.emit('GAME_ENTER',data);
    },
    reset(callback) {
        this.node.emit('GAME_RESET');

        if (callback && typeof callback == "function") {
            callback();
        }
    },
    resetCallbackWhenHide() {
        if (this.callBackWhenHide && typeof this.callBackWhenHide == "function") {
            this.callBackWhenHide = null;
        }
    }
});
