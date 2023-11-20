cc.Class({
    extends: require('SlotTablev2'),

    stopSpinning(data, callback) {
        this.matrix = data.matrix;
        this.node.bigSymbols = [];
        this.stopSpinningCallbackCount = 0;

        for (let col = 0; col < this.tableFormat.length; ++col) {
            const currentCol = this.matrix[col];
            let matrix = [];
            for (let row = currentCol.length-1; row >=0 ; --row) {
                let symbolValue = currentCol[row];

                this.node.emit('CHECK_MEGA_SYMBOL',symbolValue,col,row);

                matrix.push(symbolValue);
            }
            this.node.reels[col].stopSpinningWithDelay(col, matrix, data, this.checkStopSpinningCallback.bind(this, matrix, callback));
        }
        
        if (this.table) {
            this.table.bigSymbols = this.node.bigSymbols;
        }

        this.node.emit('REEL_ABOUT_TO_STOP_NEARWIN', {reels: this.node.reels, data, context: this,});
        this.node.emit('REEL_ABOUT_TO_STOP_SOUND', {reels: this.node.reels, data, context: this,});
        this.node.emit('REEL_ABOUT_TO_STOP_EFFECT', {reels: this.node.reels, data, context: this,});
        this.node.emit('REEL_ABOUT_TO_STOP_MISC', {reels: this.node.reels, data, context: this,});
        if(this.stickyWild) {
            this.stickyWild.emit("UPDATE_MATRIX", this.matrix);
        }
    },
});