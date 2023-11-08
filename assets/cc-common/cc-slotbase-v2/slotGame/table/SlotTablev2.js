

cc.Class({
    extends: require('SlotTable'),

    properties: {
        stickyWildNode: cc.Node
    },

    onLoad() {
        if (!this.table) this.table = this.node;

        this.node.on("INIT",this.init,this);
        this.node.on("SET_MODE",this.setMode,this);
        this.node.on("START_SPINNING",this.startSpinning,this);
        this.node.on("STOP_SPINNING",this.stopSpinning,this);
        this.node.on("FAST_TO_RESULT",this.fastToResult,this);
        this.node.on("CHANGE_MATRIX",this.changeMatrix,this);
        this.node.on("UPDATE_SYMBOL_LIST", this.updateSymbolList, this);
        this.node.on("STOP_REEL_ROOL",this.stopReelRoll,this);
        this.node.on("STOP_REEL_WITH_RANDOM_MATRIX",this.stopReeWithRandomMatrix,this);
        this.node.on("SHOW_STATIC_SYMBOL",this.showStaticSymbol,this);
        this.node.on("GAME_EXIT", this.gameExit, this);
        this.node.on("PLAY_ANIM_DEBUG", this.playAnimDebug, this);
        this.node.on("FORCE_RESET_TABLE_EFFECT", this.forceResetTableEffect, this);
        this.node.mode = 'FAST';
        if (this.node.config.SHOW_BEAUTY_MATRIX) {
            this.node.on("HIDE_ANIM_INTRO", this.hideAnimIntro.bind(this));
            this.node.on("SHOW_ANIM_INTRO", this.showAnimIntro.bind(this));
        }
    },
    init() {
        this.isFastToResult = false;
        this.node.isFreeMode = this.isFreeMode;
        this.node.curentConfig = this.node.config.STATS[this.node.mode];
        this.node.reels = [];
        this.tableFormat = this.node.config.TABLE_FORMAT;
        for (let col = 0; col < this.tableFormat.length; ++col) {
            const reel = cc.instantiate(this.reelPrefab);
            //Must attach to node so component can be loadded
            reel.name = "Reel_" + col;
            reel.parent = this.table;
            //Then we can use this
            reel.mainComponent.init(this.tableFormat[col], this.node.config, col, this.symbolPrefab, this.isFreeMode);
            reel.setPosition(this.getXPosition(col), 0);
            this.node.reels[col] = reel.mainComponent;
        }

        this.stickyWild = this.stickyWildNode || this.node.getChildByName("StickyWild");
        if(this.stickyWild) {
            this.stickyWild.emit("INIT", this);
        }
        if (this.node.config.SHOW_BEAUTY_MATRIX && this.isFreeMode == false) {
            let ranInt = this.getRandomMatrixIndex();
            this.strM  = this.node.config.BEAUTY_MATRIX[ranInt];
            this.showAnimIntro();
        }
    },
    getXPosition(index) {
        let startX = -(this.tableFormat.length / 2 - 0.5) * this.node.config.SYMBOL_WIDTH;
        return (startX + this.node.config.SYMBOL_WIDTH * index);
    },
    setMode(mode) {
        this.node.mode = mode;
    },
    changeMatrix({matrix, rowOffset = 0}) {
        this.matrix = matrix;
        for (let col = 0; col < this.tableFormat.length; ++col) {
            const reel  = this.node.reels[col];
            for (let row = 0; row < this.tableFormat[col]; ++row) {
                if(reel){
                    const symbol = reel.showSymbols[row+rowOffset];
                    if(symbol) symbol.changeToSymbol(this.matrix[col][row]);
                }
            }
        }
        if(this.stickyWild) {
            this.stickyWild.emit("CHANGE_MATRIX", matrix);
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
    stopReeWithRandomMatrix(callback) {
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
        this.stopSpinning(this.matrixRandom, () => {
            callback && callback();
        });
    },
    updateSymbolList(value) {
        this.node.reels.forEach(reel => {
            reel.getComponent("SlotReel").symbolList = value;
        });
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
        if(this.stickyWild) {
            this.stickyWild.emit("UPDATE_MATRIX", this.matrix);
        }
    },
    checkStopSpinningCallback(matrix, callback) {
        this.stopSpinningCallbackCount++;
        const count = this.stopSpinningCallbackCount;

        if (count >= this.node.reels.length && callback && typeof callback == "function") {
            callback();
        }
        
        this.node.emit('REEL_STOP_NEARWIN',{matrix, count, context: this,});
        this.node.emit('REEL_STOP_SOUND',{matrix, count, context: this,});
        this.node.emit('REEL_STOP_EFFECT',{matrix, count, context: this,});
        this.node.emit('REEL_STOP_MISC',{matrix, count, context: this,});
        if(this.stickyWild) {
            const skipAnimation = this.node.parent.gSlotDataStore.gameSpeed > 1;
            this.stickyWild.emit("SHOW_STICKY_WILD", count - 1, skipAnimation);
        }
    },
    fastToResult() {
        if (this.stopSpinningCallbackCount < this.node.reels.length) {
            this.isFastToResult = true;
            for (let col = 0; col < this.node.reels.length; ++col) {
                this.node.reels[col].fastStopSpinning();
            }
        }
    },
    gameExit(){
        if(this.stickyWild) {
            this.stickyWild.emit("RESET");
        }
    },

    showStaticSymbol(col, row, symbol, isShow) {
        if (!this.node.reels || !this.node.reels[col] || !this.node.reels[col].showSymbols) return;
        const staticSymbol = this.node.reels[col].showSymbols[row];
        if (staticSymbol && staticSymbol.symbol === symbol) {
            staticSymbol.opacity = isShow ? 255 : 0;
        }
    },

    playAnimDebug() {
        this.node.emit("SETUP_PAYLINES", this.matrixRandom);
        
    },

    getBeautyMatrixRandom(){
        let matrix  = this.strM.split(",");
        let lastMatrix = this.node.gSlotDataStore.convertSlotMatrix(matrix, this.node.config.TABLE_FORMAT);
        return lastMatrix;
    },

    showAnimIntro(){
        if (!this.isFreeMode && this.node.config.SHOW_BEAUTY_MATRIX){
            let bt = this.getBeautyMatrixRandom();
            this.node.reels.forEach( (reel, index )=> {
                reel.updateSymbols(bt[index]);
            });
        }
    },

    hideAnimIntro(){
        this.node.reels.forEach(reel=> {
            reel.hideAnimIntro();
        });
    },

    getRandomMatrixIndex(){
        let ranInt = 0;
        let length = this.node.config.BEAUTY_MATRIX.length;
        do {
            ranInt = Math.floor(Math.random() * length);
        } while(this.findStoredRndIndex(ranInt));
        return ranInt;
    },

    findStoredRndIndex(ranInt){
        let length = this.node.config.BEAUTY_MATRIX.length;
        const strKey = this.node.config.GAME_ID + 'rndIntroMatrixArray';
        let res = cc.sys.localStorage.getItem(strKey);
        if (res != null) res = JSON.parse(res);
        if (res == null || res.length >= length) {
            cc.sys.localStorage.setItem(strKey, {length : 0});
            res = {length : 0};
        }

        if (res[ranInt] == undefined){
            res[ranInt] = ranInt;
            res.length++;
            cc.sys.localStorage.setItem(strKey, JSON.stringify(res));
            return false;
        }
        return true;
    },

    forceResetTableEffect() {
        // override code
    },
});