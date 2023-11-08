

cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad() {
        this.node.hasBigWild = true;
    },
    start () {
        this.node.transformSymbol = this.transformSymbol.bind(this);
    },
    transformSymbol(symbolValue, col, row) {
        let newSymbol = symbolValue;
        if (symbolValue == "K") {
            if (col == 1) {
                newSymbol = "KST";
            } else if (col == 3) {
                newSymbol = "KTT";
            } else {
                newSymbol = "KMN";
            }
        }

        this.node.parent.bigSymbols.map(bigSymbol => {
            if ((row >= bigSymbol.row && row < bigSymbol.row + bigSymbol.height) 
            && col >= bigSymbol.col && col < bigSymbol.col + bigSymbol.width) {
                newSymbol = "";
            }
            if (row == bigSymbol.row && col == bigSymbol.col) {
                newSymbol = bigSymbol.value;
            }
        });

        return newSymbol;
    },
});
