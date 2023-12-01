
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

        // if (result && result.extraData) {
        //     if (result.extraData.subSymGrandNormal) {
        //         this.subSymGrandNormal = [...result.extraData.subSymGrandNormal];
        //     }
        //     if (result.extraData.subSymMajorNormal) {
        //         this.subSymMajorNormal = [...result.extraData.subSymMajorNormal];
        //     }
        //     if (result.extraData.subSymGrandFree) {
        //         this.subSymGrandFree = [...result.extraData.subSymGrandFree];
        //         for (let i = 0; i < this.subSymGrandFree.length; i++) {
        //             if (this.subSymGrandFree[i] >= 15) {
        //                 this.subSymGrandFree[i] += 2;
        //             } else {
        //                 this.subSymGrandFree[i] += 1;
        //             }
        //         }
        //     }
        //     if (result.extraData.subSymMajorFree) {
        //         this.subSymMajorFree = [...result.extraData.subSymMajorFree];
        //         for (let i = 0; i < this.subSymMajorFree.length; i++) {
        //             if (this.subSymMajorFree[i] >= 15) {
        //                 this.subSymMajorFree[i] += 2;
        //             } else {
        //                 this.subSymMajorFree[i] += 1;
        //             }
        //         }
        //     }
        // }

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

        let startX = (-format.length / 2 + 0.5) * (symbolWidth - 10);

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
                    symbol.parent = this.normalReelContainer;
                    symbol.setPosition(startX + col * (symbolWidth - 10), startY - row * (symbolHeight));
                } else {
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
        // if (this.gameMode == "normal") {
        //     if (this.subSymGrandNormal) {
        //         this.subSymGrandNormal.forEach(subSymbol => {
        //             let symbol = this.listSymbol[subSymbol];
        //             symbol.showSmallSubSymbol('s1');
        //         });
        //     }
        //     if (this.subSymMajorNormal) {
        //         this.subSymMajorNormal.forEach(subSymbol => {
        //             let symbol = this.listSymbol[subSymbol];
        //             symbol.showSmallSubSymbol('s2');
        //         });
        //     }
        // }
        // else {
        //     if (this.subSymGrandFree) {
        //         this.subSymGrandFree.forEach(subSymbol => {
        //             let symbol = this.listSymbol[subSymbol];
        //             symbol.showSmallSubSymbol('s1');
        //         });
        //     }
        //     if (this.subSymMajorFree) {
        //         this.subSymMajorFree.forEach(subSymbol => {
        //             let symbol = this.listSymbol[subSymbol];
        //             symbol.showSmallSubSymbol('s2');
        //         });
        //     }
        // }
    },

    clearTable() {
        this.normalReelContainer.children.forEach(it => it.opacity = 0);
        this.freeReelContainer.children.forEach(it => it.opacity = 0);
        this.wildMultiplierText.active = false;
        this.wildMultiplierText.emit("HIDE_FAST");
        this.freeGameID.node.active = false;
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
});
