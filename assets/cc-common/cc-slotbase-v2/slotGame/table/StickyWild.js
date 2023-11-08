

cc.Class({
    extends: cc.Component,

    properties: {
        wildSymbolPrefab: cc.Prefab,
        defaultNumber: 5,
        stickySymbol: 'K',
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on("INIT", this.init, this);
        this.node.on("SHOW_STICKY_WILD", this.showStickyWild, this);
        this.node.on("RESET", this.reset, this);
        this.node.on("UPDATE_MATRIX", this.updateMatrix, this);
        this.node.on("CHANGE_MATRIX", this.changeMatrix, this);
    },

    initWildPool() {
        this.symbolPool = new cc.NodePool("StickyWildPool");
        for (let i=0; i<this.defaultNumber; i++) {
            this.symbolPool.put(cc.instantiate(this.wildSymbolPrefab));
        }
    },

    init(table){
        this.table = table;
        this.COLUMN = this.table.tableFormat.length;
        this.ROW = this.table.tableFormat[0];
        this.SYMBOL_HEIGHT = this.table.node.config.SYMBOL_HEIGHT;
        this.SYMBOL_WIDTH = this.table.node.config.SYMBOL_WIDTH;
        this.wildMatrix = Array.from(Array(this.COLUMN), () => new Array(this.ROW) );
        if(!this.wildSymbolPrefab) {
            this.wildSymbolPrefab = this.table.symbolPrefab;
        }
        this.initWildPool();
    },

    showStickyWild(reelIdx, skipAnimation = false) {
        for(let i = 0; i < this.ROW; ++i){
            if(this.matrix[reelIdx][i] == this.stickySymbol && !this.wildMatrix[reelIdx][i]) {
                let wild = this.getStickyWild();
                this.wildMatrix[reelIdx][i] = wild;
                wild.parent = this.node;
                wild.emit('RESET');
                wild.x = this.table.getXPosition(reelIdx);
                wild.y = this.getYPosition(i);
                this.playWildAnimation(wild, skipAnimation);
            }
        }
    },

    playWildAnimation(wildNode, isSkip = false) {
        // extend when do anything with wild
        wildNode.emit("PLAY_ANIMATION", isSkip);
    },

    getStickyWild() {
        if (!this.symbolPool.size()) {
            this.symbolPool.put(cc.instantiate(this.wildSymbolPrefab));
        }
        return this.symbolPool.get();
    },

    getYPosition(index){
        let startY = -(this.ROW / 2 + 0.5) * this.SYMBOL_HEIGHT;
        return (startY + this.SYMBOL_HEIGHT * (this.ROW - index));
    },

    reset(){
        for(let i = 0; i < this.COLUMN; ++i){
            for(let j = 0; j < this.ROW; ++j) {
                if(this.wildMatrix[i][j]) {
                    this.wildMatrix[i][j].emit('RESET');
                    this.symbolPool.put(this.wildMatrix[i][j]);
                }
                this.wildMatrix[i][j] = null;
            }
        }
        this.node.removeAllChildren(true);
    },

    updateMatrix(matrix){
        this.matrix = matrix;
    },

    changeMatrix(matrix){
        this.reset();
        this.updateMatrix(matrix);
        for(let i = 0; i < this.COLUMN; ++i){
            this.showStickyWild(i, true);
        }
    },

    onDestroy(){
        this.symbolPool.clear();
    }

    // update (dt) {},
});
