const STATE = cc.Enum({
    IDLE: 0,
    FALL_OUT: 1,
    FALL_OUT_DONE: 2,
    FALL_IN: 3,
    EASING: 4,
});
const SYMBOL_SCATTER = 'A';
cc.Class({
    extends: require('SlotReelv2'),

    properties: {
        symbolPrefab: cc.Node
    },

    onLoad() {
        this._super();
        this._easingRatio = [0.25, 0.13, 0.05];
        this.specialSymbolNames = '2,3,4,A,K';
        this._specialSymbol = [];
        this.matrix = [];
    },

    init(showNumber = 3, gameConfig = null, col = 0, symbolPrefab = null, isFreeMode = false) {
        this.col = col;
        // this.config = gameConfig;
        this.config = gameConfig;
        if (isFreeMode) {
            this.symbolList = this.config.SYMBOL_NAME_LIST_FREE[col];
        } else {
            this.symbolList = this.config.SYMBOL_NAME_LIST[col];
        }
        this.isFreeMode = isFreeMode;

        this.showNumber = showNumber;
        this.totalNumber = this.showNumber * 2;

        this.symbolPrefab = symbolPrefab;
        this.showSymbols = [];
        this.hideSymbols = [];

        this.symbolStartShowY = this.config.SYMBOL_HEIGHT;
        this.symbolStartHideY = (this.showNumber + 1.5) * this.config.SYMBOL_HEIGHT;

        for (let i = 0; i < this.totalNumber; ++i) {
            const symbol = cc.instantiate(this.symbolPrefab);
            symbol.name = "Symbol_" + i;
            symbol.parent = this.reel;
            symbol.storeCol = col;
            symbol.changeToSymbol(this.getRandomSymbolNameWithException(SYMBOL_SCATTER));
            if (i >= showNumber) {
                this.showSymbols.push(symbol);
                symbol.y = this._getSymbolShowY(i % this.showNumber);
            } else {
                this.hideSymbols.push(symbol);
                symbol.y = this._getSymbolHideY(i);
            }
        } // 0 -> 5; top -> bot
        this.mode = 'FAST';
        this.durationFall = 1;
        this.index = 0;
        this.curentConfig = this.config.STATS[this.mode];
        this._state = STATE.IDLE;
        this._setupMode();
    },

    _setupMode() {
        this._dur = this.curentConfig.DURATION;
        this._gravity = this.config.SYMBOL_HEIGHT / (this._dur * this._dur);
    },

    _getEasingDis(row) {
        return this._easingRatio[row] * this.config.SYMBOL_HEIGHT;
    },
    _getEasingDur(row) {
        return 2 * this._getEasingDis(row) / this._gravity ** 1 / 2;
    },

    _getSymbolShowY(row) { // 0,1,2
        return this.symbolStartShowY - row * this.config.SYMBOL_HEIGHT;
    },
    _getSymbolHideY(row) { // 0,1,2
        return this.symbolStartHideY - row * this.config.SYMBOL_HEIGHT;
    },

    startSpinningWithDelay(delay) {
        this._state = STATE.FALL_OUT;
        this._isStopping = false;
        this.matrix = [];
        this.curentConfig = this.config.STATS[this.mode];
        let reelDelayStart = delay * this.curentConfig.REEL_DELAY_START;
        this.isFastToResult = false;
        this.curentConfig = this.config.STATS[this.mode];
        this._setupMode();
        for (let row = 0; row < this.showSymbols.length; row++) {
            let symbol = this.showSymbols[row];
            symbol._actionFallHire = cc.sequence(
                cc.delayTime(reelDelayStart),
                cc.moveBy(this._dur, 0, - 3.5 * this.config.SYMBOL_HEIGHT).easing(cc.easeQuadraticActionIn()),
                cc.callFunc(() => {
                    if(row === this.showSymbols.length - 1){
                        this._state = STATE.FALL_OUT_DONE;
                        if(this.matrix.length === this.showNumber){
                            this._stopSpinning();
                        }
                    }
                })
            );
            symbol.stopAllActions();
            symbol.runAction(symbol._actionFallHire);
        }
    },

    stopSpinningWithDelay(delay, matrix = [], callback) {
        this.matrix = matrix;
        this.callbackStopReel = callback ? callback : () => { };
    },

    update() {
        if(this._isStopping) return;
        if (this.matrix.length === this.showNumber /* got data */ && this._state === STATE.FALL_OUT_DONE) {
            let delay = this.col * this.curentConfig.REEL_DELAY_START;
            this._stopSpinning(delay);
        }
    },

    _stopSpinning(delay = 0) {
        if(this._isStopping === true) return;
        this._isStopping = true;
        this._state = STATE.FALL_IN;
        for (let row = this.hideSymbols.length - 1; row >= 0; row--) {
            let symbol = this.hideSymbols[row];
            // symbol.active = true;
            symbol.changeToSymbol(this.matrix[row]);
            let easingY = this._getEasingDis(row);
            let easingDur = this._getEasingDur(row);
            !symbol.isWinJp && (symbol.opacity = 255);
            symbol._actionFallIn = cc.sequence(
                cc.delayTime(delay + easingDur),
                cc.moveTo(this._dur, symbol.x, this._getSymbolShowY(row)).easing(cc.easeQuadraticActionIn()),
                cc.moveTo(easingDur, symbol.x, this._getSymbolShowY(row) + easingY).easing(cc.easeQuadraticActionOut()),
                cc.moveTo(easingDur, symbol.x, this._getSymbolShowY(row)).easing(cc.easeQuadraticActionIn()),
                cc.callFunc(() => {
                    // save the symbol need to change parent to on top layer
                    if(this.specialSymbolNames.indexOf(symbol.symbol) > -1){
                        this._specialSymbol.unshift(symbol);
                    }
                    if (row === 0) {
                        this.onReelStop();
                        this.callbackStopReel && this.callbackStopReel();
                    }
                    if(row === 2){
                        let eventOnReelDown = new cc.Event.EventCustom('REEL_TOUCH_GROUND', true);
                        eventOnReelDown.setUserData({col: this.col});
                        this.node.dispatchEvent(eventOnReelDown);
                    }
                })
            );
            symbol.stopAllActions();
            symbol.runAction(symbol._actionFallIn);
            if (this.isFastToResult && symbol._actionFallIn) {
                symbol._actionFallIn.speed(4);
            }
        }
    },

    onReelStop() {
        this._state = STATE.IDLE;
        for (let row = 0; row < this.showSymbols.length; row++) {
            let symbol = this.showSymbols[row];
            symbol.y = this._getSymbolHideY(row);
        }
        // switch 2 arrays: showSymbols with hideSymbols 
        // for next Spin and show payline
        let _hideSymbols = this.hideSymbols;
        this.hideSymbols = this.showSymbols;
        this.showSymbols = _hideSymbols;
        this._storeSymbols();
    },
    _storeSymbols(){
        for (let i = 0; i < this._specialSymbol.length; i++) {
            let symbol = this.showSymbols[i];
            if (this.slotTable) {
                this.slotTable.storeSpecialSymbols(symbol, this.reel);
            }
        }
    },
    fastStopSpinning() {
        this.isFastToResult = true;
        this.showSymbols.forEach(symbol => {
            symbol._actionFallHire && symbol._actionFallHire.speed(4);
        });
        this.hideSymbols.forEach(symbol => {
            symbol._actionFallIn && symbol._actionFallIn.speed(4);
        });
    },

    fadeOutShowSymbols() {
        this.showSymbols.forEach(symbol => {
            symbol.opacity !== 0 && symbol.runAction(cc.fadeOut(0.5));
        });
    },

    resetSymbols() {
        this.showSymbols.forEach(symbol => {
            symbol.opacity = 255;
        });
        this.hideSymbols.forEach(symbol => {
            symbol.opacity = 255;
        });
    },

    reset(){
        this._specialSymbol = [];
    },

    bindTable(table) {
        this.slotTable = table;
    },
    processSymbolOnWinJackpot(){
        this.hideSymbols.forEach(symbol => {
            symbol.isWinJp = true;
            symbol.opacity = 0;
        });
    }
});
