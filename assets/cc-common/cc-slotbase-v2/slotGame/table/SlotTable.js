

cc.Class({
    extends: cc.Component,
    properties: {
        table: cc.Node,
        reelPrefab: cc.Prefab,
        symbolPrefab: cc.Prefab,
        isFreeMode: false
    },
    onLoad() {
        if (!this.table) this.table = this.node;

        this.node.on("INIT",this.init,this);
        this.node.on("SET_MODE",this.setMode,this);
        this.node.on("START_SPINNING",this.startSpinning,this);
        this.node.on("STOP_SPINNING",this.stopSpinning,this);
        this.node.on("FAST_TO_RESULT",this.fastToResult,this);
        this.node.on("CHANGE_MATRIX",this.changeMatrix,this);

        this.node.on("STOP_REEL_ROOL",this.stopReelRoll,this);
        this.node.on("STOP_REEL_WITH_RANDOM_MATRIX",this.stopReeWithRandomMatrix,this);

        this.node.mode = 'FAST';
    },
    init() {
        this.isFastToResult = false;
        this.node.curentConfig = this.node.config.STATS[this.node.mode];
        this.node.reels = [];
        this.tableFormat = this.node.config.TABLE_FORMAT;
        for (let col = 0; col < this.tableFormat.length; ++col) {
            const reel = cc.instantiate(this.reelPrefab);
            //Must attach to node so component can be loadded
            reel.name = "Reel_" + col;
            reel.parent = this.table;
            //Then we can use this
            reel.mainComponent.init(this.tableFormat[col], this.node.config, col, this.symbolPrefab);
            reel.x = this.getXPosition(col);
            reel.y += -1*(this.tableFormat[col] - 3)*this.node.config.SYMBOL_HEIGHT/2;
            this.node.reels[col] = reel.mainComponent;
        }
    },
    getXPosition(index) {
        return (this.node.config.SYMBOL_WIDTH + this.node.config.SYMBOL_MARGIN_RIGHT) * index;
    },
    setMode(mode) {
        this.node.mode = mode;
    },
    changeMatrix({matrix, rowOffset = 0}) {
        this.matrix = matrix;
        for (let col = 0; col < this.tableFormat.length; ++col) {
            for (let row = 0; row < this.tableFormat[col]; ++row) {
                this.node.reels[col].showSymbols[row+rowOffset].changeToSymbol(this.matrix[col][row]);
            }
        }
    },
    stopReelRoll() {
        for (let col = 0; col < this.node.reels.length; ++col) {
            this.node.reels[col].stopReelRoll();
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
    stopReeWithRandomMatrix() {
        this.matrixRandom = [];
        for (let col = 0; col < this.tableFormat.length; ++col) {
            this.matrixRandom[col] = [];
            for (let row = this.tableFormat[col] - 1; row >=0 ; --row) {
                const reel = this.node.reels[col];
                if(reel && reel.getRandomSymbolNameWithExceptions){
                    this.matrixRandom[col][row] = reel.getRandomSymbolNameWithExceptions(['A', 'R', 'K']);
                }else{
                    this.matrixRandom[col][row] = "3";
                }
            }
        }
        this.stopSpinning(this.matrixRandom, () => {});
    },

    stopSpinning(data, callback) {
        this.matrix = data;
        this.node.bigSymbols = [];
        this.stopSpinningCallbackCount = 0;

        for (let col = 0; col < this.tableFormat.length; ++col) {
            const currentCol = this.matrix[col];
            let matrix = [];
            for (let row = currentCol.length-1; row >=0 ; --row) {
                let symbolValue = currentCol[row];

                this.node.emit('CHECK_MEGA_SYMBOL',symbolValue,col,row);

                matrix.push(symbolValue);
            }
            this.node.reels[col].stopSpinningWithDelay(col, matrix, this.checkStopSpinningCallback.bind(this, matrix, callback));
        }
        
        if (this.table) {
            this.table.bigSymbols = this.node.bigSymbols;
        }

        this.node.emit('REEL_ABOUT_TO_STOP_NEARWIN', {reels: this.node.reels, data, context: this,});
        this.node.emit('REEL_ABOUT_TO_STOP_SOUND', {reels: this.node.reels, data, context: this,});
        this.node.emit('REEL_ABOUT_TO_STOP_EFFECT', {reels: this.node.reels, data, context: this,});
        this.node.emit('REEL_ABOUT_TO_STOP_MISC', {reels: this.node.reels, data, context: this,});
    },
    checkStopSpinningCallback(matrix, callback) {
        this.stopSpinningCallbackCount++;
        const count = this.stopSpinningCallbackCount;

        if (count >= this.node.reels.length && callback && typeof callback == "function") {
            this.node.runAction(cc.sequence([
                cc.delayTime(this.node.curentConfig.REEL_EASING_TIME*2),
                cc.callFunc(()=>{
                    callback();
                })
            ]));
        }
        
        this.node.emit('REEL_STOP_NEARWIN',{matrix, count, context: this,});
        this.node.emit('REEL_STOP_SOUND',{matrix, count, context: this,});
        this.node.emit('REEL_STOP_EFFECT',{matrix, count, context: this,});
        this.node.emit('REEL_STOP_MISC',{matrix, count, context: this,});
    },
    fastToResult() {
        if (this.stopSpinningCallbackCount < this.node.reels.length) {
            this.isFastToResult = true;
            for (let col = 0; col < this.node.reels.length; ++col) {
                this.node.reels[col].fastStopSpinning();
            }
        }
    },
});