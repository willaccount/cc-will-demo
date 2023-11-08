

const baseActor = require("baseActor");
cc.Class({
    extends: baseActor,
    __ctor__(director) {
        this.director = director;
        this.nodeView = director.nodeView;

        const {closeGameBtn, minimizeBtn} = this.nodeView;

        closeGameBtn.off('click');
        closeGameBtn.on('click', () => {
            this.director.closeGame();
        });

        minimizeBtn.off('click');
        minimizeBtn.on('click', () => {
            this.director.minimizeGame();
        });
    },
});
