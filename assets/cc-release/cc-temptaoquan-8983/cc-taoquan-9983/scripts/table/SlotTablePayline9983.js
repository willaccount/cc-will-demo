const NodePool = require('NodePool9983');
cc.Class({
    extends: require('SlotTablePaylinev2'),

    properties: {
        isFreeMode: true,
    },
    start() {
        this._super();
        this.node.on("SHOW_SUB_SYMBOL_PAYLINE",this.showSubSymbolPayLine,this);
        this.node.on("HIDE_SUB_SYMBOL_PAYLINE",this.hideSubSymbolPayLine,this);
        this.node.on("HIDE_PAYLINES",this.hideAllPaylines,this);
    },

    onLoad() {
        this._super();
        this.paylineSymbolPool = new NodePool('SlotSymbolPayline9983');
        this.paylineSymbolPool.init(this.paylineNormalSymbol, 5);
        this.usingObj = [];
        if (this.isFreeMode) {
            this.tempMatrix = [
                [-1,0,1,2],
                [3,4,5,6],
                [7,8,9,10],
                [11,12,13,14],
                [-1,15,16,17]
            ];
        } else {
            this.tempMatrix = [
                [0,1,2],
                [3,4,5],
                [6,7,8],
                [9,10,11],
                [12,13,14]
            ];
        }
        this.subSymbolHolderNode = [];
        this.isValidScatter = [true, false, false, false, false];
        if (!this.isFreeMode) {
            this.tableFormat = this.node.config.TABLE_FORMAT;
        } else {
            this.tableFormat = this.node.config.TABLE_FORMAT_FREE;
        }
    },
 
    setupPaylines(matrix, payLines) {
        this.node.curentConfig = this.node.config.STATS[this.node.mode];
        this.paylineHolderNode.active = true;
        this.payLineNormals = payLines;
        this.paylinesMatrix = [];
        this.scatterHolderNode = [];
        this.bonusHolderNode = [];
        this.wildHolderNode = [];
        this.subSymbolHolderNode = [];
        this.isValidScatter = [true, false, false, false, false];
        const {subSym1, subSym2} = this.node.gSlotDataStore.lastEvent;
        const {fSubSym1, fSubSym2} = this.node.gSlotDataStore.lastEvent;

        let count = this.tableFormat * this.tableFormat[0];
        for (let col = 0; col < this.node.reels.length; ++col) {
            this.paylinesMatrix[col] = [];
            for (let row = 0; row < this.node.reels[col].showSymbols.length; ++row) {
                const symbol = this.node.reels[col].showSymbols[row];
                const paylineSymbol = this.createPaylineSymbol(this.node.reels[col],symbol.symbol, col, row);
                count--;
                paylineSymbol.setSiblingIndex(count);
                paylineSymbol.currentIndex = count;
                const payline = { symbol, paylineSymbol };
                this.paylinesMatrix[col][row] = payline;
                if (symbol.symbol == "A" ) {
                    if (col > 0) {
                        this.isValidScatter[col] = this.isValidScatter[col - 1] == true;
                    }
                    this.scatterHolderNode.push(payline);
                } else if (symbol.symbol[0] == "K") {
                    this.wildHolderNode.push(payline);
                }
                if (subSym1 && subSym1.indexOf(this.tempMatrix[col][row]) >= 0) {
                    this.subSymbolHolderNode.push(payline);
                }  
                if (subSym2 && subSym2.indexOf(this.tempMatrix[col][row]) >= 0) {
                    this.subSymbolHolderNode.push(payline);
                }  
                if (fSubSym1 && fSubSym1.indexOf(this.tempMatrix[col][row]) >= 0) {
                    this.subSymbolHolderNode.push(payline);
                }  
                if (fSubSym2 && fSubSym2.indexOf(this.tempMatrix[col][row]) >= 0) {
                    this.subSymbolHolderNode.push(payline);
                }
            }
        }
        this.paylineHolderNode.opacity = 0;
    },

    createPaylineSymbol(reel, symbol, col, row) {
        let paylineSymbol;
        paylineSymbol = this.paylineSymbolPool.getObj();
        this.usingObj.push(paylineSymbol);
        paylineSymbol.parent = this.paylineHolderNode;
        paylineSymbol.x = this.getXPosition(col);
        paylineSymbol.y = ((reel.showNumber/2 - row - 0.5)) * this.node.config.SYMBOL_HEIGHT;
        paylineSymbol.disableHighlight();
        paylineSymbol.currentCol = col;
        paylineSymbol.init(symbol);
        return paylineSymbol;
    },

    getXPosition(index) {
        let startX = -(this.tableFormat.length / 2 - 0.5) * this.node.config.SYMBOL_WIDTH;
        return (startX + this.node.config.SYMBOL_WIDTH * index);
    },

    showSubSymbolPayLine(data,callback){
        if (data == 0) {
            this.node.dispatchEvent( new cc.Event.EventCustom('PLAY_SUBSYMBOL_MAJOR', true) );
        } else if (data == 1) {
            this.node.dispatchEvent( new cc.Event.EventCustom('PLAY_SUBSYMBOL_GRAND', true) );
        }
        this.paylineHolderNode.opacity = 255;
        this.disableHighlightNormalPaylines();
        this.subSymbolHolderNode.forEach((child) => {
            child.symbol.enableHighlight();
            child.symbol.playAnimation();
            child.paylineSymbol.enableHighlight();
            child.paylineSymbol.playAnimationSubSymbol(data);
        });
        this.scheduleOnce(() => {
            this.subSymbolHolderNode.opacity = 0;
            if (callback && typeof callback == "function") {
                callback();
            }
        }, this.node.curentConfig.ANIMATION_DURATION);
    },

    hideSubSymbolPayLine(){
        this.subSymbolHolderNode.forEach((child) => {
            child.paylineSymbol.hideAnimationSubSymbol();
            child.symbol.addSmallSubSymbol();
        });
    },

    showNormalPaylineAllLine({payLineSymbol: symbolId, paylineMaxColumn}) {
        this.disableHighlightNormalPaylines();
        for (let col = 0; col < paylineMaxColumn; col++) {
            if (this.paylinesMatrix[col] && this.paylinesMatrix[col].length) {
                for (let row = 0; row < this.paylinesMatrix[col].length; row++) {
                    const { symbol, paylineSymbol } = this.paylinesMatrix[col][row];
                    if (symbol && paylineSymbol) {
                        if (symbol.symbol == symbolId || symbol.symbol[0] == "K") {
                            if (symbol.symbol[0] == "K") {
                                symbol.blinkHighlight();
                                paylineSymbol.playWinLineEffect();
                                paylineSymbol.setSiblingIndex(paylineSymbol.currentIndex || 0);
                            } else {
                                symbol.enableHighlight(paylineSymbol.isSpineSymbol());
                                symbol.playAnimation();
                                paylineSymbol.enableHighlight();
                                paylineSymbol.setSiblingIndex(paylineSymbol.currentIndex || 0);
                                paylineSymbol.playAnimation();
                            }
                        }
                    }
                }
            }
        }
    },

    blinkNormalPaylineAllline({payLineSymbol: symbolId, paylineMaxColumn}) {
        for (let col = 0; col < paylineMaxColumn; col++) {
            if (this.paylinesMatrix[col] && this.paylinesMatrix[col].length) {
                for (let row = 0; row < this.paylinesMatrix[col].length; row++) {
                    const { symbol, paylineSymbol } = this.paylinesMatrix[col][row];
                    if (symbol.symbol == symbolId || symbol.symbol[0] == "K") {
                        if (symbol.symbol[0] == "K") {
                            symbol.blinkHighlight();
                            paylineSymbol.playWinLineEffect();
                        } else {
                            symbol.blinkHighlight(this.node.curentConfig.BLINK_DURATION, this.node.curentConfig.BLINKS);
                            paylineSymbol.blinkHighlight(this.node.curentConfig.BLINK_DURATION, this.node.curentConfig.BLINKS);
                        }
                    }
                }
            }
        }
    },

    disableHighlightNormalPaylines() {
        for (let col = 0; col < this.paylinesMatrix.length; ++col) {
            if (this.paylinesMatrix[col] && this.paylinesMatrix[col].length) {
                for (let row = 0; row < this.paylinesMatrix[col].length; ++row) {
                    const { symbol, paylineSymbol } = this.paylinesMatrix[col][row];
                    symbol.active = true;
                    symbol.disableHighlight();
                    if (symbol.symbol[0] == 'K') {
                        paylineSymbol.hideWinLineEffect();
                    } else {
                        symbol.stopAnimation();
                        paylineSymbol.disableHighlight();
                        paylineSymbol.stopAnimation();
                    }
                }
            }
        }
    },

    clearPaylines() {
        this._super();
        for (let i = 0; i < this.usingObj.length; i++) {
            this.usingObj[i].remove();
        }
        this.usingObj = [];
    },

    showSpecialPayline(node, callback) {
        this.showingPayline = false;
        this.paylineTime = 0;
        this.tablePaylineInfo.emit('HIDE_PAYLINE');
        this.paylineHolderNode.opacity = 255;
        this.disableHighlightNormalPaylines();
        node.forEach((child) => {
            if (this.isValidScatter[child.paylineSymbol.currentCol]) {
                child.symbol.enableHighlight(true);
                child.symbol.playAnimation();
                child.paylineSymbol.enableHighlight();
                child.paylineSymbol.playAnimation();
            }
        });
        this.scheduleOnce(() => {
            node.opacity = 0;
            callback && callback();
        }, this.node.curentConfig.ANIMATION_DURATION);
    },

    hideAllPaylines() {
        this.showingPayline = false;
        this.paylineTime = 0;
        this.tablePaylineInfo.emit('HIDE_PAYLINE');
        for (let col = 0; col < this.paylinesMatrix.length; ++col) {
            if (this.paylinesMatrix[col] && this.paylinesMatrix[col].length) {
                for (let row = 0; row < this.paylinesMatrix[col].length; ++row) {
                    this.paylinesMatrix[col][row].symbol.active = true;
                    this.paylinesMatrix[col][row].symbol.disableHighlight();
                    this.paylinesMatrix[col][row].symbol.stopAnimation();
                    this.paylinesMatrix[col][row].paylineSymbol.disableHighlight();
                    this.paylinesMatrix[col][row].paylineSymbol.stopAnimation();
                    this.paylinesMatrix[col][row].symbol.reset();
                }
            }
        }
    },
});
