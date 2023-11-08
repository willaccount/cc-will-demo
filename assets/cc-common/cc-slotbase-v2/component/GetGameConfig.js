cc.Class({
    extends: cc.Component,

    properties: {
        soundPlayer: true,
        gameConfig: true,
        dataStore: true,
        director: false,
        directorIndex: 1,
        needPool: false
    },

    onLoad() {
        let director;
        if (this.node.ROOT) {
            director = this.node.ROOT;
        } else {
            director = cc.find('Canvas').children[this.directorIndex];
        }

        if (this.soundPlayer) {
            this.node.soundPlayer = director.soundPlayer;
        }
        if (this.gameConfig) {
            this.node.config = director.config;
        }
        if (this.dataStore) {
            this.node.gSlotDataStore = director.gSlotDataStore;
        }
        if (this.needPool) {
            this.node.poolFactory = director.poolFactory;
        }
        if (director) this.node.mainDirector = director;
    },
});
