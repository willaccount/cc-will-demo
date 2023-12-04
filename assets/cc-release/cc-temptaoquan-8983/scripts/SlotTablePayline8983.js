cc.Class({
    extends: require('SlotTablePaylinev2'),

    properties: {
        scatterNode: cc.Node,
    },

    initProperties() {
        this.paylineSymbolPool = null;
    },

    onLoad() {
        this.initProperties();
        this._super();
        this.createPaylineSymbolPools();

        this.node.on("RESET_SYMBOL_PAYLINE", this.resetSymbolPaylines, this);
    },

    setupPaylines(matrix, payLines) {
        this.node.curentConfig = this.node.config.STATS[this.node.mode];
        this.config = this.node.config;
        this.paylineHolderNode.active = true;
        this.payLineNormals = payLines;
        this.paylinesMatrix = [];
        this.scatterHolderNode = [];
        this.bonusHolderNode = [];
        this.wildHolderNode = [];
        this.jackpotHolderNode = [];
        this.subSymbolHolderNode = [];
        this.subSymbol1 = [];
        this.subSymbol2 = [];
        this.subsymbolMatrix = [];
        this.isSubSymbol = false;
        this.tableFormat = this.isFreeMode ? this.config.TABLE_FORMAT_FREE : this.node.config.TABLE_FORMAT;

        for (let col = 0; col < this.node.reels.length; ++col) {
            this.paylinesMatrix[col] = [];
            for (let row = 0; row < this.node.reels[col].showSymbols.length; ++row) {
                const symbol = this.node.reels[col].showSymbols[row];
                const paylineSymbol = this.createPaylineSymbol(this.node.reels[col], symbol.symbol, col, row);
                const payline = {
                    symbol, paylineSymbol,
                };
                this.paylinesMatrix[col][row] = payline;

                if (symbol.symbol == "A") {
                    this.scatterHolderNode.push(payline);
                    paylineSymbol.parent = this.scatterNode;
                } else if (symbol.symbol == "K") {
                    this.wildHolderNode.push(payline);
                }
                if (this.isSubSymbol) {
                    this.subSymbolHolderNode.push(payline);
                }
            }
        }
        this.paylineHolderNode.opacity = 0;
    },

    convertSubSymbolIndexToMatrix() {
        let offsetIndex = 0;
        for (let col = 0; col < this.tableFormat.length; ++col) {
            this.subsymbolMatrix[col] = [];
            for (let row = 0; row < this.tableFormat[col]; row++) {
                let currentIndex = offsetIndex + row;
                this.subsymbolMatrix[col][row] = 0;
                if (this.subSymbol1 && this.subSymbol1.indexOf(currentIndex) >= 0) {
                    this.subsymbolMatrix[col][row] = 1;
                }
                if (this.subSymbol2 && this.subSymbol2.indexOf(currentIndex) >= 0) {
                    this.subsymbolMatrix[col][row] = 2;
                }
            }
            offsetIndex += this.tableFormat[col];
        }
    },

    createPaylineSymbolPools() {
        this.paylineSymbolPool = new cc.NodePool("poolPayline8983");
        for (let i = 0; i < this.node.config.PAYLINE_SYMBOLS_LENGTH; ++i) {
            let paylineSymbol = cc.instantiate(this.paylineNormalSymbol);
            paylineSymbol.parent = this.paylineHolderNode;
            paylineSymbol.active = true;
            this.paylineSymbolPool.put(paylineSymbol);
        }
    },

    getPaylineFromPool() {
        if (!this.paylineSymbolPool) return null;
        return this.paylineSymbolPool.get();
    },

    createPaylineSymbol(reel, symbol, col, row) {
        let paylineSymbol = this.getPaylineFromPool();

        if (!paylineSymbol) return null;

        paylineSymbol.parent = this.paylineHolderNode;
        paylineSymbol.active = true;

        paylineSymbol.x = this.getXPosition(col);
        if (reel.showNumber == 4) {
            paylineSymbol.y = ((reel.showNumber / 2 - row - 0.5)) * this.node.config.SYMBOL_HEIGHT + 80;
        } else {
            paylineSymbol.y = ((reel.showNumber / 2 - row - 0.5)) * this.node.config.SYMBOL_HEIGHT;
        }
        paylineSymbol.changeToSymbol(symbol);
        paylineSymbol.disableHighlight();
        return paylineSymbol;
    },

    clearPaylines() {
        if (this._blinkingCallback) {
            this.unschedule(this._blinkingCallback);
            this._blinkingCallback = null;
        }
        this.showingPayline = false;
        this.paylineTime = 0;
        this.resetSymbolPaylines();
        this.recallPaylineSymbol();
        // this.paylineHolderNode.removeAllChildren();
        this.paylineHolderNode.active = false;
        this.paylinesMatrix = [];
        this.scatterHolderNode = [];
        this.bonusHolderNode = [];
        this.wildHolderNode = [];
        this.jackpotHolderNode = [];
        this.tablePaylineInfo.emit('HIDE_PAYLINE');
        this.subsymbolMatrix = [];
        this.subSymbol1 = [];
        this.subSymbol2 = [];
    },

    recallPaylineSymbol() {
        for (let col = 0; col < this.paylinesMatrix.length; ++col) {
            for (let row = 0; row < this.paylinesMatrix[col].length; ++row) {
                const paylineObj = this.paylinesMatrix[col][row];
                if (paylineObj) {
                    const { paylineSymbol: payline } = paylineObj;
                    if (payline) {
                        this.paylineSymbolPool.put(payline);
                    }
                }
            }
        }
    },

    showWildPayLine(freeGameOptionID = 0, callback) {
        this.showSpecialPayline(freeGameOptionID, this.wildHolderNode, callback);
    },

    showJackpotPayLine(callback) {
    },

    showSpecialPayline(freeGameOptionID, node, callback) {
        this.paylineHolderNode.opacity = 255;
        this.disableHighlightNormalPaylines();
        node.forEach((child) => {
            child.symbol.enableHighlight();
            child.symbol.playAnimation();
            child.paylineSymbol.enableHighlight();
            child.paylineSymbol.playAnimation(freeGameOptionID);
        });
        cc.director.getScheduler().schedule(function(){
            node.opacity = 0;
            if (callback && typeof callback == "function") {
                callback();
            }
        }, this, 0, 0, this.node.curentConfig.ANIMATION_DURATION, false);
    },

    showNormalPaylineAllLine({ symbolId, symbolCount }) {
        this.disableHighlightNormalPaylines();
        for (let col = 0; col < symbolCount; col++) {
            for (let row = 0; row < this.paylinesMatrix[col].length; row++) {
                const { symbol, paylineSymbol } = this.paylinesMatrix[col][row];
                const isNormalSymbol = (symbol.symbol == symbolId) && (symbol.symbol != 'A');

                if (isNormalSymbol) {
                    symbol.active = true;
                    paylineSymbol.enableHighlight();
                    paylineSymbol.playAnimation();
                }
            }
        }
    },

    blinkNormalPaylineAllline({ symbolId, symbolCount }) {
        for (let col = 0; col < symbolCount; col++) {
            for (let row = 0; row < this.paylinesMatrix[col].length; row++) {
                const { symbol, paylineSymbol } = this.paylinesMatrix[col][row];
                if (symbol.symbol == symbolId || symbol.symbol == "K") {
                    symbol.blinkHighlight(this.node.curentConfig.BLINK_DURATION, this.node.curentConfig.BLINKS);
                    paylineSymbol.blinkHighlight(this.node.curentConfig.BLINK_DURATION, this.node.curentConfig.BLINKS);
                }
            }
        }
    },

    disableHighlightNormalPaylines() {
        for (let col = 0; col < this.paylinesMatrix.length; ++col) {
            for (let row = 0; row < this.paylinesMatrix[col].length; ++row) {
                const { symbol, paylineSymbol } = this.paylinesMatrix[col][row];

                if (symbol.symbol != 'K') {
                    symbol.active = true;
                    symbol.disableHighlight();
                    symbol.stopAnimation();
                    paylineSymbol.disableHighlight();
                    paylineSymbol.stopAnimation();
                }
            }
        }
    },
});