cc.Class({
    extends: require('SlotTablePaylinev2'),

    initProperties() {
        this.paylineSymbolPool = null;
    },

    onLoad() {
        this.initProperties();
        this._super();
        this.createPaylineSymbolPools();
    },

    createPaylineSymbolPools() {
        this.paylineSymbolPool = new cc.NodePool();
        for (let i = 0; i < this.node.config.PAY_LINE_SYMBOL_POOL_LENGTH; ++i) {
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
        paylineSymbol.y = ((reel.showNumber / 2 - row - 0.5)) * this.node.config.SYMBOL_HEIGHT;
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

        // let data = {
        //     paylineSymbol: paylineObj.paylineSymbol,
        // };
        // data.paylineSymbol

    },
});