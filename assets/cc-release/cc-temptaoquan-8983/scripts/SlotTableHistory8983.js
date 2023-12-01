
cc.Class({
    extends: require("SlotTableHistory"),

    properties: {
        normalReelContainer: cc.Node,
        freeReelContainer: cc.Node,
        wildMultiplierText: cc.Node,
        freeGameID: sp.Skeleton
    },

    onLoad() {
        this._super();

        this.symbolPool = new cc.NodePool("SymbolPool");
        this.freePool = new cc.NodePool("FreePool");
        this.isShowFree = false;
        this.listSymbol = [];
    },

    hideAllSymbolNode() {
        this.freeGame.active = false;
        this.normalGame.active = false;
    },

    renderResult(data) {
        this.hideAllSymbolNode();
        this.clearTable();
        this.clearPools();
        this.betDenom = data.betDenom;
        this.currentMode = data.mode;

        this.subSymGrandNormal = [];
        this.subSymMajorNormal = [];
        this.subSymGrandFree = [];
        this.subSymMajorFree = [];
        const { result } = data;
        const { matrixResult } = data;
        const { wildNormalMulplier, wildFreeMulplier } = result.metaData;
        const { subSymGrandNormal, subSymMajorNormal, subSymGrandFree, subSymMajorFree } = result.extraData;

        if (result && result.extraData) {
            if(subSymGrandNormal) {
                this.convertSubSymbolIndexToMatrix("grand", subSymGrandNormal, this.subSymGrandNormal, this.node.config.TABLE_FORMAT);
            } else if (subSymMajorNormal) {
                this.convertSubSymbolIndexToMatrix("major", subSymMajorNormal, this.subSymMajorNormal, this.node.config.TABLE_FORMAT);
            } else if (subSymGrandFree) {
                this.convertSubSymbolIndexToMatrix("grand", subSymGrandFree, this.subSymGrandFree, this.node.config.TABLE_FORMAT_FREE);
            } else if (subSymMajorFree) {
                this.convertSubSymbolIndexToMatrix("major", subSymMajorFree, this.subSymMajorFree, this.node.config.TABLE_FORMAT_FREE);
            }
        }

        this.gameMode = data.mode;

        switch (data.mode) {
            case "normal":
                this.martrixFormat = this.node.config.TABLE_FORMAT;
                this.normalReelContainer.active = true;
                this.freeReelContainer.active = false;
                this.isShowFree = false;
                this.normalGame.active = true;
                this.normalGame.opacity = 255;

                this.renderGameTable(matrixResult, this.martrixFormat);
                this.renderExtendData(data);

                break;
            case "free":
                this.martrixFormat = this.node.config.TABLE_FORMAT_FREE;
                this.normalReelContainer.active = false;
                this.freeReelContainer.active = true;
                this.isShowFree = true;
                this.freeGame.active = true;
                this.freeGame.opacity = 255;

                this.renderGameTable(matrixResult, this.martrixFormat, data.selectedOption);
                this.renderExtendData(data);

                break;
        }

        this.wildMultiplierText.emit("HIDE_FAST");
        this.setMultiplier(wildNormalMulplier, wildFreeMulplier, data.selectedOption);
    },

    setMultiplier(wildNormalMulplier, wildFreeMulplier, freeGameOptionID = 0) {
        if (wildNormalMulplier && wildNormalMulplier > 1) {
            this.wildMultiplierText.active = true;
            this.wildMultiplierText.emit("ACTIVE_FAST", wildNormalMulplier, 1);
        }
        if (wildFreeMulplier && wildFreeMulplier > 1) {
            this.wildMultiplierText.active = true;
            this.wildMultiplierText.emit("ACTIVE_FAST", wildFreeMulplier, freeGameOptionID);
        }
    },

    renderGameTable(matrix, format, freeGameOptionID = 0) {
        let symbolWidth = this.node.config.SYMBOL_WIDTH;
        let symbolHeight = this.node.config.SYMBOL_HEIGHT;
        let count = 0;
        this.listSymbol = [];

        if (freeGameOptionID > 0) {
            this.freeGameID.node.active = true;
            this.freeGameID.setSkin("skin" + freeGameOptionID);
        }

        for (let col = 0; col < format.length; col++) {
            for (let row = 0; row < format[col]; row++) {
                let symbol = this.getSymbol(this.currentMode);
                let startY = (format[col] / 2 - 0.5) * (symbolHeight);
                let startY2 = (format[col] / 2 - 0.5) * (symbolHeight / 2);

                if (this.gameMode == "normal") {
                    let startX = (-format.length / 2 + 0.5) * (symbolWidth - 10);

                    symbol.parent = this.normalReelContainer;
                    symbol.setPosition(startX + col * (symbolWidth - 10), startY - row * (symbolHeight));
                } else {
                    let startX = (-format.length / 2 + 0.5) * (symbolWidth - 5);

                    symbol.parent = this.freeReelContainer;
                    if (col == 0 || col == (format.length - 1)) {
                        symbol.setPosition(startX + col * (symbolWidth - 5), startY2 - row * (symbolHeight));
                    } else {
                        symbol.setPosition(startX + col * (symbolWidth - 5), startY - row * (symbolHeight));
                    }

                }
                let symbolName = matrix[count];
                symbol.changeToSymbol(symbolName);
                symbol.col = col;
                symbol.row = row;
                symbol.val = symbolName;
                this.listSymbol.push(symbol);
                count++;
            }
        }

        // add sub symbol
        if (this.gameMode == "normal") {
            if (this.subSymGrandNormal) {
                this.subSymGrandNormal.forEach(subSymbol => {
                    if(subSymbol == 1) {
                        symbol.showSmallSubSymbolFast('s1');
                    }
                });
            }
            if (this.subSymMajorNormal) {
                this.subSymMajorNormal.forEach(subSymbol => {
                    if(subSymbol == 2) {
                        symbol.showSmallSubSymbolFast('s2');
                    }
                });
            }
        }
        else {
            if (this.subSymGrandFree) {
                this.subSymGrandFree.forEach(subSymbol => {
                    if(subSymbol == 1) {
                        symbol.showSmallSubSymbolFast('s1');
                    }
                });
            }
            if (this.subSymMajorFree) {
                this.subSymMajorFree.forEach(subSymbol => {
                    if(subSymbol == 2) {
                        symbol.showSmallSubSymbolFast('s2');
                    }
                });
            }
        }
    },

    clearTable() {
        this.normalReelContainer.children.forEach(it => it.opacity = 0);
        this.freeReelContainer.children.forEach(it => it.opacity = 0);
        this.wildMultiplierText.active = false;
        this.wildMultiplierText.emit("HIDE_FAST");
        this.freeGameID.node.active = false;
        this.subSymGrandNormal = [];
        this.subSymMajorNormal = [];
        this.subSymGrandFree = [];
        this.subSymMajorFree = [];
    },

    clearPools() {

        this.showingPayline = false;

        if (this.gameMode == "free") {
            let freePool = this.freePool;
            while (this.symbolNode.children.length > 0) {
                freePool.put(this.freeReelContainer.children[0]);
            }
        } else {
            let normalPool = this.symbolPool;
            while (this.symbolNode.children.length > 0) {
                normalPool.put(this.normalReelContainer.children[0]);
            }
        }
        this.paylineInfo.emit('HIDE_PAYLINE');
    },

    convertSubSymbolIndexToMatrix(type, subSymbols, matrix = [], format) {

        let offsetIndex = 0;
        for (let col = 0; col < format.length; ++col) {
            matrix[col] = [];
            for (let row = 0; row < format[col]; row++) {
                let currentIndex = offsetIndex + row;
                matrix[col][row] = 0;
                if (type == "grand" && subSymbols.indexOf(currentIndex) >= 0) {
                    matrix[col][row] = 1;
                }
                if (type == "major" && subSymbols.indexOf(currentIndex) >= 0) {
                    matrix[col][row] = 2;
                }
            }
            offsetIndex += format[col];
        }
    },
});
