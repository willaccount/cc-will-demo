cc.Class({
    extends: require('SlotTablev2'),

    properties: {
        fishFlyingController : cc.Node
    },

    onLoad() {
        this._super();
        this.node.on("SET_WILD_TYPE", this.setWildType, this);
    },

    init() {
        this.isFastToResult = false;
        this.node.isFreeMode = this.isFreeMode;
        this.node.curentConfig = this.node.config.STATS[this.node.mode];
        this.node.reels = [];
        this.tableFormat = this.isFreeMode ? this.node.config.TABLE_FORMAT_FREE : this.node.config.TABLE_FORMAT;
        for (let col = 0; col < this.tableFormat.length; ++col) {
            const reel = cc.instantiate(this.reelPrefab);
            //Must attach to node so component can be loadded
            reel.name = "Reel_" + col;
            reel.parent = this.table;
            //Then we can use this
            reel.zIndex = this.tableFormat.length - 1 - col;
            reel.mainComponent.init(this.tableFormat[col], this.node.config, col, this.symbolPrefab, this.isFreeMode);
            reel.setPosition(this.getXPosition(col), 0);
            this.node.reels[col] = reel.mainComponent;
            reel.mainComponent.initTable(this);
        }
    },

    startSpinning() {
        this.isStopRunning = false;
        this.isHavingFakeWild = false;
        this._super();
    },

    stopReeWithRandomMatrix(callback) {
        let matrixRandom = [];
        for (let col = 0; col < this.tableFormat.length; ++col) {
            matrixRandom[col] = [];
            for (let row = this.tableFormat[col] - 1; row >= 0; --row) {
                matrixRandom[col][row] = this.node.reels[col].getRandomSymbolNameWithException(["A", "K", "s1", "s2"]);
            }
        }
        this.stopSpinning({ matrix: matrixRandom, subSym: [] }, () => {
            callback && callback();
        });
    },

    stopSpinning(data, callback) {
        const { matrix, subSym } = data;
        this.tableData = data;
        this.matrix = matrix;
        this.subSym = subSym;
        this.node.bigSymbols = [];
        this.stopSpinningCallbackCount = 0;
        this.countSoundScatter = 0;
        for (let col = 0; col < this.tableFormat.length; ++col) {
            const currentCol = this.matrix[col];
            let matrix = [];
            let checkAdd = false;
            for (let row = currentCol.length - 1; row >= 0; --row) {
                let symbolValue = currentCol[row];
                this.node.emit('CHECK_MEGA_SYMBOL', symbolValue, col, row);
                matrix.push(symbolValue);
                if (symbolValue == 'A' && checkAdd == false) {
                    checkAdd = true;
                    this.countSoundScatter = this.countSoundScatter + 1;
                }
            }
            this.node.reels[col].stopSpinningWithDelay(col, matrix, data, this.checkStopSpinningCallback.bind(this, matrix, callback), this.isMissWild(this.matrix));
        }

        if (this.table) {
            this.table.bigSymbols = this.node.bigSymbols;
        }

        this.node.emit('REEL_ABOUT_TO_STOP_NEARWIN', { reels: this.node.reels, data: matrix, subSym, context: this, });
        this.node.emit('REEL_ABOUT_TO_STOP_SOUND', { reels: this.node.reels, data: matrix, context: this, });
        this.node.emit('REEL_ABOUT_TO_STOP_EFFECT', { reels: this.node.reels, data: matrix, context: this, });
        this.node.emit('REEL_ABOUT_TO_STOP_MISC', { reels: this.node.reels, data: matrix, context: this, });
    },

    isMissWild(matrix) {
        if (this.isFreeMode) return;
        this.lastWildColumn = -1;
        let countWild = 0;
        for (let col = 0; col < matrix.length; col++) {
            for (let row = 0; row < matrix[col].length; row++) {
                if (matrix[col][row] === 'K') {
                    countWild++;
                    this.lastWildColumn = col;
                }
            }
        }
        return countWild === 0;
    },

    changeMatrix({ matrix, rowOffset = 0 }) {
        this.matrix = matrix;
        for (let col = 0; col < this.tableFormat.length; ++col) {
            for (let row = 0; row < this.tableFormat[col]; ++row) {
                this.node.reels[col].showSymbols[row + rowOffset].changeToSymbol(this.matrix[col][row]);
            }
        }
    },

    checkStopSpinningCallback(matrix, callback) {
        this._super(matrix, callback);
        if (this.fishFlyingController && !this.isFastToResult) {
            this.fishFlyingController.emit('PLAY_SOUND_FISH_FLYING_END', this.stopSpinningCallbackCount - 1);
        }
        if (this.stopSpinningCallbackCount >= this.node.reels.length && callback && typeof callback == "function") {
            this.node.emit('STOP_SPINNING_SOUND');
            this.fishFlyingController.emit('STOP_FISH_FLYING_EFFECT');
        }
    },

    setWildType(type) {
        for (let col = 0; col < this.tableFormat.length; ++col) {
            this.node.reels[col].setWildType(type);
        }
    },

    playFishFlyingAnimation(fishFlyingData) {
        fishFlyingData.isTurbo = this.node.mode === 'TURBO';
        fishFlyingData.lastWildColumn = this.lastWildColumn;
        this.fishFlyingController.emit('PLAY_FISH_FLYING_EFFECT', fishFlyingData);
    },
    
    speedUpFishFlyingEffect(fishFlyingData) {
        this.fishFlyingController.emit('SPEED_UP_FISH_FLYING_EFFECT', fishFlyingData);
    },
});