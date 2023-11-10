
cc.Class({
    extends: require("SlotTableHistory"),

    properties: {
        normalSymbolNode: cc.Node,
        freeSymbolNode234: cc.Node,
        freeSymbolNode15: cc.Node,

        normalMultiplyNode: cc.Node,
        freeMultiplyNode: cc.Node,

        wildOptionNode: cc.Node,
    },

    onLoad() {
        this._super();

        this.highCostSymbols = ["2", "3", "4", "5", "6"];
        this.lowCostSymbols = ["7", "8", "9", "10", "J", "Q"];

        this.isShowFree = false;
        this.listSymbol = [];
    },

    hideAllSymbolNode() {
        this.freeGame.active = false;
        this.normalGame.active = false;
    },

    renderResult(data) {
        let matrixResult = data.matrixResult.slice();
        if (data.mode == "free") {
            matrixResult.splice(15, 0, "1");
            matrixResult.splice(0, 0, "1");
        }

        this.hideAllSymbolNode();
        this.clearTable();
        this.betDenom = data.betDenom;
        this.currentMode = data.mode;

        this.subSymGrandNormal = [];
        this.subSymMajorNormal = [];
        this.subSymGrandFree = [];
        this.subSymMajorFree = [];
        const { result } = data;


        if (result && result.extraData) {
            if (result.extraData.subSymGrandNormal) {
                this.subSymGrandNormal = [...result.extraData.subSymGrandNormal];
            }
            if (result.extraData.subSymMajorNormal) {
                this.subSymMajorNormal = [...result.extraData.subSymMajorNormal];
            }
            if (result.extraData.subSymGrandFree) {
                this.subSymGrandFree = [...result.extraData.subSymGrandFree];
                for (let i = 0; i < this.subSymGrandFree.length; i++) {
                    if (this.subSymGrandFree[i] >= 15) {
                        this.subSymGrandFree[i] += 2;
                    } else {
                        this.subSymGrandFree[i] += 1;
                    }
                }
            }
            if (result.extraData.subSymMajorFree) {
                this.subSymMajorFree = [...result.extraData.subSymMajorFree];
                for (let i = 0; i < this.subSymMajorFree.length; i++) {
                    if (this.subSymMajorFree[i] >= 15) {
                        this.subSymMajorFree[i] += 2;
                    } else {
                        this.subSymMajorFree[i] += 1;
                    }
                }
            }
        }


        this.gameMode = data.mode;

        switch (data.mode) {
            case "normal":
                this.martrixFormat = this.node.config.TABLE_FORMAT;
                this.normalSymbolNode.active = true;
                this.freeSymbolNode234.active = false;
                this.freeSymbolNode15.active = false;
                this.isShowFree = false;
                this.normalGame.active = true;
                this.normalGame.opacity = 255;

                this.renderGameTable(matrixResult, this.martrixFormat);
                this.renderExtendData(data);

                break;
            case "free":
                this.martrixFormat = this.node.config.TABLE_FORMAT_FREE;
                this.normalSymbolNode.active = false;
                this.freeSymbolNode234.active = true;
                this.freeSymbolNode15.active = true;
                this.isShowFree = true;
                this.freeGame.active = true;
                this.freeGame.opacity = 255;

                this.renderGameTable(matrixResult, this.martrixFormat, data.selectedOption);
                this.renderExtendData(data);

                break;
        }

        this.normalMultiplyNode.emit("HIDE_FAST");
        this.freeMultiplyNode.emit("HIDE_FAST");
        if (data.paylines) {
            data.paylines = data.paylines.replace(/\s+/g, "");
            let stringArr = data.paylines
                .slice(1, data.paylines.length - 1)
                .split(",");
            this.paylines = this.node.gSlotDataStore.convertPayLine(stringArr);
            this.paylineIndex = 0;
            this.showingPayline = true;
            
            if (result && result['metaData']) {
                const { metaData } = result;
                if (metaData) {
                    const { wildFreeMulplier, wildNormalMulplier } = metaData;

                    if (wildNormalMulplier && wildNormalMulplier > 1) {
                        this.normalMultiplyNode.emit("ACTIVE_FAST", wildNormalMulplier, 7);
                    }
                    if (wildFreeMulplier && wildFreeMulplier > 1) {
                        this.freeMultiplyNode.emit("ACTIVE_FAST", wildFreeMulplier, data.selectedOption);
                    }
                }
            }
        }
    },

    getMultiplier(paylines) {
        let mul = 1;
        for (let i = 0; i < paylines.length; i++) {
            if (mul < Number(paylines[i].wildMultiplier)) {
                mul = Number(paylines[i].wildMultiplier);
            }
        }
        return mul;
    },

    renderGameTable(matrix, format, fgOption = 0) {
        let symbolWidth = this.node.config.SYMBOL_WIDTH;
        let symbolHeight = this.node.config.SYMBOL_HEIGHT;


        let count = 0;
        if (fgOption > 0) {
            this.wildOptionNode.changeToSymbol(fgOption);
        }
        this.listSymbol = [];
        for (let i = 0; i < format.length; i++) {
            for (let j = 0; j < format[i]; j++) {
                let symbol = this.getSymbol(this.currentMode);
                if (this.gameMode == "normal") {
                    let startX = (-format.length / 2 + 0.5) * (symbolWidth - 10);
                    let startY = (format[i] / 2 - 0.5) * (symbolHeight);

                    symbol.parent = this.normalSymbolNode;
                    symbol.setPosition(startX + i * (symbolWidth - 10), startY - j * (symbolHeight));
                } else {
                    let startX = (-format.length / 2 + 0.5) * (symbolWidth - 5);
                    let startY = (format[i] / 2 - 0.5) * (symbolHeight - 10);

                    if (i == 0 || i == 4) {
                        // 1 5
                        symbol.parent = this.freeSymbolNode15;
                    } else {
                        // 2 3 4
                        symbol.parent = this.freeSymbolNode234;
                    }
                    symbol.setPosition(startX + i * (symbolWidth - 5), startY - j * (symbolHeight - 10));
                }
                symbol.removeSubSymbol();
                let symbolName = matrix[count];
                if (symbolName === 'K' && this.gameMode == "free" && fgOption) {
                    symbolName = `${symbolName}${fgOption}`;
                }
                symbol.changeToSymbol(symbolName);

                symbol.col = i;
                symbol.row = j;
                symbol.val = symbolName;

                if (this.highCostSymbols.indexOf(symbolName) > -1) {
                    symbol.zIndex = 3;
                } else if (this.lowCostSymbols.indexOf(symbolName) > -1) {
                    symbol.zIndex = 2;
                } else if (symbolName == "A") {
                    symbol.zIndex = 1;
                } else {
                    symbol.zIndex = 0;
                }
                this.listSymbol.push(symbol);
                count++;
            }
        }

        // add sub symbol
        if (this.gameMode == "normal") {
            if (this.subSymGrandNormal) {
                this.subSymGrandNormal.forEach(subSymbol => {
                    let symbol = this.listSymbol[subSymbol];
                    symbol.showSmallSubSymbol('s1');
                });
            }
            if (this.subSymMajorNormal) {
                this.subSymMajorNormal.forEach(subSymbol => {
                    let symbol = this.listSymbol[subSymbol];
                    symbol.showSmallSubSymbol('s2');
                });
            }
        }
        else {
            if (this.subSymGrandFree) {
                this.subSymGrandFree.forEach(subSymbol => {
                    let symbol = this.listSymbol[subSymbol];
                    symbol.showSmallSubSymbol('s1');
                });
            }
            if (this.subSymMajorFree) {
                this.subSymMajorFree.forEach(subSymbol => {
                    let symbol = this.listSymbol[subSymbol];
                    symbol.showSmallSubSymbol('s2');
                });
            }
        }

    },

    clearTable() {
        for (let i = 0; i < this.listSymbol.length; i++) {
            //   this.listSymbol[i].recoverSubSymbol();
        }
        this.clearSymbol(this.normalSymbolNode);
        this.clearSymbol(this.freeSymbolNode234);
        this.clearSymbol(this.freeSymbolNode15);

    },

    clearSymbol(symbolNode) {
        let pool = this.symbolPool;
        while (symbolNode.children.length > 0) {
            pool.put(symbolNode.children[0]);
        }
    },
});
