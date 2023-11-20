cc.Class({
    extends: require('SlotReelv2'),

    init(showNumber, gameConfig, col, symbolPrefab, isFreeMode) {
        this._super(showNumber, gameConfig, col, symbolPrefab, isFreeMode);

        this.subSymbolCount = 0;
        if(isFreeMode){
            this.tempMatrix = [
                [2,1,0,-1],
                [6,5,4,3],
                [10,9,8,7],
                [14,13,12,11],
                [17,16,15,-1]
            ];
        } else {
            this.tempMatrix = [
                [2,1,0],
                [5,4,3],
                [8,7,6],
                [11,10,9],
                [14,13,12]
            ];
        }
    },

    setStepToStop() {
        let bufferStepFreeGame = 0;
        if ((this.col == 0 || this.col == 4) && this.isFreeMode) {
            bufferStepFreeGame = 1;
        }
        this.step = (this.curentConfig.STEP_STOP * 2) - (this.totalNumber + bufferStepFreeGame);
    },

    stopSpinningWithDelay(delay, matrix = [], data = {}, callback) {
        const {dataMatrix, subSymbol1, subSymbol2} = data;
        this.delayIndex = delay;
        this.showSymbols = [];
        this.matrix = matrix;
        this.callbackStopReel = callback ? callback : () => {};
        let reelDelayStop = delay * this.curentConfig.REEL_DELAY_STOP;
        this.isNearWin = false;
        
        this.delay = delay;
        if(subSymbol1){
            this.subSymbol1 = subSymbol1;
        }
        if(data.subSymbol2){
            this.subSymbol2 = subSymbol2;
        }
        cc.director.getScheduler().schedule(this.setStepToStop, this, 0, 0, reelDelayStop, false);

        this.matrix.unshift(this.getRandomSymbolNameWithException('A'));
        if (this.node.config.TABLE_SYMBOL_BUFFER.BOT > 0) {
            this.matrix.push(this.getRandomSymbolNameWithException('R'));
        }
    },

    circularSymbols() {
        const symbolIndex = this.index % (this.totalNumber);
        const lastSymbol = this.reel.children[symbolIndex];
        lastSymbol.emit("REMOVE_SUB_SYMBOL");

        if (!this.showResult) {
            lastSymbol.changeToBlurSymbol(this.getRandomSymbolNameWithException(["s1", "s2"]));
        } else if (this.stop < this.totalNumber) {
            let isRealSymbol = this.stop >= this.node.config.TABLE_SYMBOL_BUFFER.TOP && this.stop < (this.showNumber + this.node.config.TABLE_SYMBOL_BUFFER.TOP);
            let symbolValue = this.matrix[this.stop++];
            this.step = this.totalNumber + this.showNumber - (this.stop + this.config.TABLE_SYMBOL_BUFFER.BOT);

            if (isRealSymbol) {
                lastSymbol.changeToSymbol(symbolValue);

                if (this.subSymbol1 && this.subSymbol1.indexOf(this.tempMatrix[this.col][this.stop - 1]) >= 0) {
                    lastSymbol.emit("ADD_SUB_SYMBOL", "s1");
                } else if (this.subSymbol2 && this.subSymbol2.indexOf(this.tempMatrix[this.col][this.stop - 1]) >= 0) {
                    lastSymbol.emit("ADD_SUB_SYMBOL", "s2");
                } else {
                    lastSymbol.emit("REMOVE_SUB_SYMBOL");
                }
            } else {
                lastSymbol.changeToBlurSymbol(symbolValue);
            }
        }
        lastSymbol.y = lastSymbol.y + this.node.config.SYMBOL_HEIGHT*(this.totalNumber);
        this.index++;
    },
});