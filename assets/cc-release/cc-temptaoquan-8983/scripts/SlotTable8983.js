cc.Class({
    extends: require('SlotTablev2'),

    onLoad() {
        this._super();

        this.node.on("CONVERT_SUB_SYMBOLS_INDEX", this.convertSubSymbolIndexToMatrix, this);
        this.node.on("SHOW_SMALL_SUB_SYMBOLS", this.showSmallSubSymbols, this);
    },

    init() {
        this.config = this.node.config;
        this.isFastToResult = false;
        this.node.isFreeMode = this.isFreeMode;
        this.node.curentConfig = this.node.config.STATS[this.node.mode];
        this.node.reels = [];
        this.tableFormat = this.isFreeMode ? this.config.TABLE_FORMAT_FREE : this.node.config.TABLE_FORMAT;

        for (let col = 0; col < this.tableFormat.length; ++col) {
            const reel = cc.instantiate(this.reelPrefab);
            reel.name = "Reel_" + col;
            reel.parent = this.table;
            reel.mainComponent.init(this.tableFormat[col], this.node.config, col, this.symbolPrefab, this.isFreeMode);
            reel.setPosition(this.getXPosition(col), 0);
            this.node.reels[col] = reel.mainComponent;
        }

        this.subsymbolMatrix = [];
    },

    convertSubSymbolIndexToMatrix(data) {
        const { subSymbol1, subSymbol2 } = data;
        
        this.subsymbolMatrix = []; // reset
        let offsetIndex = 0;
        for (let col = 0; col < this.tableFormat.length; ++col) {
            this.subsymbolMatrix[col] = [];
            for (let row = 0; row < this.tableFormat[col]; row++) {
                let currentIndex = offsetIndex + row;
                this.subsymbolMatrix[col][row] = 0;
                if (subSymbol1 && subSymbol1.indexOf(currentIndex) >=0) {
                    this.subsymbolMatrix[col][row] = 1; // subsymbol 1
                }
                if (subSymbol2 && subSymbol2.indexOf(currentIndex) >=0) {
                    this.subsymbolMatrix[col][row] = 2; // subsymbol 2
                }
            }
            offsetIndex += this.tableFormat[col];
            this.subsymbolMatrix[col].reverse();
        }
    },

    startSpinning() {
        this.isFastToResult = false;
        this.node.curentConfig = this.node.config.STATS[this.node.mode];
        for (let col = 0; col < this.node.reels.length; ++col) {
            this.node.reels[col].setMode(this.node.mode);
            this.node.reels[col].startSpinningWithDelay(col);
        }
        this.node.emit('TABLE_START_NEARWIN');
        this.node.emit('TABLE_START_SOUND');
        this.node.emit('TABLE_START_EFFECT');
        this.node.emit('TABLE_START_MISC');
    },

    stopSpinning(data, callback) {
        this.matrix = data.matrix;
        this.node.bigSymbols = [];
        this.stopSpinningCallbackCount = 0;

        for (let col = 0; col < this.tableFormat.length; ++col) {
            let matrixAtCol = this.matrix[col];
            matrixAtCol.reverse();
            this.node.reels[col].stopSpinningWithDelay(col, matrixAtCol, this.subsymbolMatrix[col], this.checkStopSpinningCallback.bind(this, matrixAtCol, callback));
        }
        
        if (this.table) {
            this.table.bigSymbols = this.node.bigSymbols;
        }

        this.node.emit('REEL_ABOUT_TO_STOP_NEARWIN', {reels: this.node.reels, data, context: this,});
        this.node.emit('REEL_ABOUT_TO_STOP_SOUND', {reels: this.node.reels, data, context: this,});
        this.node.emit('REEL_ABOUT_TO_STOP_EFFECT', {reels: this.node.reels, data, context: this,});
        this.node.emit('REEL_ABOUT_TO_STOP_MISC', {reels: this.node.reels, data, context: this,});
    },

    showSmallSubSymbols() {
        for (let col = 0; col < this.node.reels.length; ++col) {
            this.node.reels[col].showSmallSubSymbols();
        }
    },

    resetSubSymbols() {
    },

    gameExit() {
        if(this.stickyWild) {
            this.stickyWild.emit("RESET");
        }

        this.subsymbolMatrix = [];
    },
});