

cc.Class({
    extends: cc.Component,

    properties: {},

    start () {
        this.node.on("CHECK_MEGA_SYMBOL",this.mergeSymbol,this);
    },

    mergeSymbol(symbolValue, col, row) {
        if (symbolValue == "K") {
            if (row == 1 && col == 1) {
                this.node.bigSymbols.push({
                    value: "wildSymbol_KST",
                    width: 1,
                    height: 3,
                    row: row,
                    col: col,
                });
            }
            if (row == 1 && col == 3) {
                this.node.bigSymbols.push({
                    value: "wildSymbol_KTT",
                    width: 1,
                    height: 3,
                    row: row,
                    col: col,
                });
            }
        }
    }
});
