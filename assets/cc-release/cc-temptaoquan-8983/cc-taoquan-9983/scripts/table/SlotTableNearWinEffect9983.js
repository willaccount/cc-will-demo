
const NodePool = require('NodePool9983');
cc.Class({
    extends: require('SlotTableNearWinEffect'),

    properties: {
        paylineSymbol: cc.Prefab,
        nearWinHolderNode: cc.Node,
        tableNode: cc.Node,
        isNormalMode: false,
    },


    start() {
        this.node.on("REEL_STOP_NEARWIN", this.reelStopNearWin, this);
        this.node.on("TABLE_START_NEARWIN", this.reelReset, this);
        this.node.on("REEL_ABOUT_TO_STOP_NEARWIN", this.adjustReelDelay, this);
        this.reelReset();
        this.paylineSymbolPool = new NodePool('SlotSymbolPayline9983');
        this.paylineSymbolPool.init(this.paylineSymbol, 15);
        this.usingObj = [];

    },

    reelReset() {
        this.getFirstNearWin = false;
    },

    adjustReelDelay({ data, subSym }) {
        let countSubSymbol = 0;
        this.stopNearWinReel = 0;
        this.nearWinList = [];

        for (let col = 0; col < data.length; ++col) {
            let isNearWinSubSymbol = countSubSymbol >= 0;
            if (countSubSymbol != (col)) {
                isNearWinSubSymbol = false;
            }
            const isNearWin = isNearWinSubSymbol;
            for (let row = 0; row < data[col].length; ++row) {
                const symbolValue = data[col][row];
                if (subSym && subSym.indexOf((col * 3) + row) >= 0) {
                    countSubSymbol++;
                    this.createPaylineSymbol(this.node.reels[col], symbolValue, col, row, true);
                }
            }
            if (isNearWin) {
                this.nearWinList[col] = { isNearWinSubSymbol, isNearWin };
            }

        }
    },

    reelStopNearWin({ count, context }) {
        if (this.nearWinList[count] && this.nearWinList[count].isNearWin && !context.isFastToResult) {
            for (let i = count; i < this.node.reels.length; i++) {
                this.node.reels[i].adjustReelSpeed(this.node.config.SUPER_TURBO);
            }
            if (count === (this.node.reels.length - 1)) {
                cc.director.getScheduler().schedule(function () {
                    this.node.reels[count].adjustReelSpeed(this.node.curentConfig.TIME);
                }, this, 0, 0, 1, false);
            }

            if (this.nearWinList[count].isNearWinSubSymbol) {
                this.runAnimationNearWin('subSymbol', count);
            }
        }
        if (count >= this.node.reels.length) {
            this.clearSymbolPaylines();
        }
    },
    getXPosition(index) {
        return (this.node.config.SYMBOL_WIDTH + this.node.config.SYMBOL_MARGIN_RIGHT) * index + this.node.config.SYMBOL_WIDTH / 2;
    },
    createPaylineSymbol(reel, symbol, col, row, isSubSymbol = false) {
        let neawWinSymbol;

        neawWinSymbol = this.paylineSymbolPool.getObj();
        this.usingObj.push(neawWinSymbol);
        neawWinSymbol.parent = this.nearWinHolderNode;
        neawWinSymbol.init(symbol);
        neawWinSymbol.symbol = symbol;
        neawWinSymbol.isSubSymbol = isSubSymbol;
        neawWinSymbol.col = col;
        neawWinSymbol.row = row;
        neawWinSymbol.x = this.getXPosition(col);
        neawWinSymbol.y = (reel.showNumber - row + 0) * this.node.config.SYMBOL_HEIGHT - this.node.config.SYMBOL_HEIGHT / 2;
        neawWinSymbol.disableHighlight();
        neawWinSymbol.stopAnimation();

        return neawWinSymbol;
    },
    clearSymbolPaylines() {
        this.nearWinHolderNode.removeAllChildren(true);
        this.tableNode.children.forEach((reel) => {
            reel.children[0].children.forEach(symbolReel => {
                symbolReel.opacity = 255;
            });
        });
        for (let i = 0; i < this.usingObj.length; i++) {
            this.usingObj[i].remove();
        }
        this.usingObj = [];
    },

    runAnimationNearWin(symbolName, currentIndex) {
        this.nearWinHolderNode.children.forEach(symbol => {
            if ((symbolName === 'subSymbol' && symbol.isSubSymbol || symbol.symbol === symbolName) && symbol.col < currentIndex) {
                symbol.opacity = 255;
                symbol.enableHighlight();
                symbol.playAnimation();
                this.tableNode.children[symbol.col].children[0].children[symbol.row + 1].opacity = 0;
            }

        });
    },

});
