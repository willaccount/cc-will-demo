cc.Class({
    extends: cc.Component,

    properties: {
        directorIndex: 1,
    },

    onLoad() {
        let director;
        if (this.node.ROOT) {
            director = this.node.ROOT;
        } else {
            director = cc.find('Canvas').children[this.directorIndex];
        }

        if (director) this.node.poolFactory = director.poolFactory;
    },

});
