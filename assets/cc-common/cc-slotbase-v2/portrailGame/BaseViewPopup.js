cc.Class({
    extends: require('CutsceneMode'),

    show() {
        this._super();

        // diplay transition
        this.node.show();
    },

    enter() {
        this._super();
    },

    exit() {
        // overide exit
        // must have TweenView component

        let startCB = () => {};
        let endCB = () =>{
            this.node.opacity = 0;
            this.node.active = false;
        };
        this.node.hide(startCB, endCB);
    }
});
