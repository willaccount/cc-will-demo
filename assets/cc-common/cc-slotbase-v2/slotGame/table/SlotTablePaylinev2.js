

const {convertAssetArrayToObject} = require('utils');

cc.Class({
    extends: cc.Component,

    properties: {
        paylineHolderNode: cc.Node,
        tablePaylineInfo: cc.Node,
        paylineNormalSymbol: cc.Prefab,
        paylineSpecialSymbols: {
            type: cc.Prefab,
            default: [],
        }
    },
    onLoad() {
        this.node.hasPayline = false;
        if(!this.tablePaylineInfo) this.tablePaylineInfo = this.node;
        this.paylinesMatrix = [];
        this.paylineSpecial = convertAssetArrayToObject(this.paylineSpecialSymbols);
        this.showNormalPayline = this.node.config.PAY_LINE_ALLWAYS ? this.showNormalPaylineAllLine : this.showNormalPaylinePerline;
        this.blinkNormalPayline = this.node.config.PAY_LINE_ALLWAYS ? this.blinkNormalPaylineAllline : this.blinkNormalPaylinePerline;
        this.paylineTime = 0;
        this.node.on("SETUP_PAYLINES",this.setupPaylines,this);
        this.node.on("BLINK_ALL_NORMAL_PAYLINES",this.blinkHighlightPaylines,this);
        this.node.on("SHOW_ALL_NORMAL_PAYLINES",this.showAllNormalPayLines,this);
        this.node.on("SHOW_ALL_FREE_PAYLINES", this.showAllFreePaylines,this);
        this.node.on("SHOW_SCATTER_PAYLINE",this.showScatterPayLine,this);
        this.node.on("SHOW_BONUS_PAYLINE",this.showBonusPayLine,this);
        this.node.on("SHOW_JACKPOT_PAYLINE",this.showJackpotPayLine,this);
        this.node.on("SHOW_WILD_PAYLINE",this.showWildPayLine,this);
        this.node.on("CLEAR_PAYLINES",this.clearPaylines,this);
    },
    start() {
        this.node.hasPayline = true;
    },
    setupPaylines(matrix, payLines) {
        this.node.curentConfig = this.node.config.STATS[this.node.mode];
        this.paylineHolderNode.active = true;
        this.payLineNormals = payLines;
        this.paylinesMatrix = [];
        this.scatterHolderNode = [];
        this.bonusHolderNode = [];
        this.wildHolderNode = [];
        this.jackpotHolderNode = [];

        for (let col = 0; col < this.node.reels.length; ++col) {
            this.paylinesMatrix[col] = [];
            for (let row = 0; row < this.node.reels[col].showSymbols.length; ++row) {
                const symbol = this.node.reels[col].showSymbols[row];
                const paylineSymbol = this.createPaylineSymbol(this.node.reels[col],symbol.symbol, col, row);
                const payline = {
                    symbol, paylineSymbol,
                };
                this.paylinesMatrix[col][row] = payline;
                if (symbol.symbol == "A") {
                    this.scatterHolderNode.push(payline);
                } else if (symbol.symbol == "R") {
                    this.bonusHolderNode.push(payline);
                } else if (symbol.symbol == "K") {
                    this.wildHolderNode.push(payline);
                } else if (symbol.symbol == "JP") {
                    this.jackpotHolderNode.push(payline);
                }
            }
        }

        this.paylineHolderNode.opacity = 0;
    },
    getXPosition(index) {
        let startX = -(this.node.config.TABLE_FORMAT.length / 2 - 0.5) * this.node.config.SYMBOL_WIDTH;
        return (startX + this.node.config.SYMBOL_WIDTH * index);
    },
    createPaylineSymbol(reel, symbol, col, row) {
        let paylineSymbol;
        if (this.paylineSpecial[symbol]) {
            paylineSymbol = cc.instantiate(this.paylineSpecial[symbol]);
        } else {
            paylineSymbol = cc.instantiate(this.paylineNormalSymbol);
        }
        paylineSymbol.parent = this.paylineHolderNode;
        paylineSymbol.x = this.getXPosition(col);
        paylineSymbol.y = ((reel.showNumber/2 - row - 0.5)) * this.node.config.SYMBOL_HEIGHT;
        paylineSymbol.changeToSymbol(symbol);
        paylineSymbol.disableHighlight();
        return paylineSymbol;
    },
    
    //Show each line for ANIMATION_DURATION time
    showAllNormalPayLines(callback, index = 0) {
        if (!this.payLineNormals) {
            callback && callback();
            return;
        }
        this.paylineIndex = index;
        this.showingPayline = true;
        this.paylineType = 'normal';
        this.callbackShowPayline = callback;
        if (this.node.config.PAY_LINE_ALLWAYS && this.node.gSlotDataStore && !this.node.gSlotDataStore.isAutoSpin) {
            this.nextPaylineTime = this.node.curentConfig.EXPECT_PAYLINE_ALLWAYS_TIME;
        } else {
            this.nextPaylineTime = Math.max(this.node.curentConfig.EXPECT_PAYLINE_TIME / this.payLineNormals.length, this.node.curentConfig.MIN_TIME_EACH_PAYLINE);
        }
        this.showNextPayline();
    },
    showAllFreePaylines(callback, index = 0)
    {
        if (!this.payLineNormals) {
            callback && callback();
            return;
        }
        this.paylineIndex = index;
        this.showingPayline = true;
        this.paylineType = 'free';
        this.callbackShowPayline = callback;
        this.nextPaylineTime = Math.max(this.node.curentConfig.EXPECT_PAYLINE_TIME / this.payLineNormals.length, this.node.curentConfig.MIN_TIME_EACH_PAYLINE);
        this.showNextPayline();
    },
    resetSymbolPaylines() {
        for (let col = 0; col < this.paylinesMatrix.length; ++col) {
            for (let row = 0; row < this.paylinesMatrix[col].length; ++row) {
                this.paylinesMatrix[col][row].symbol.active = true;
                this.paylinesMatrix[col][row].symbol.reset();
                this.paylinesMatrix[col][row].paylineSymbol.reset();
            }
        }
    },
    disableHighlightNormalPaylines() {
        for (let col = 0; col < this.paylinesMatrix.length; ++col) {
            for (let row = 0; row < this.paylinesMatrix[col].length; ++row) {
                this.paylinesMatrix[col][row].symbol.active = true;
                this.paylinesMatrix[col][row].symbol.disableHighlight();
                this.paylinesMatrix[col][row].symbol.stopAnimation();
                this.paylinesMatrix[col][row].paylineSymbol.disableHighlight();
                this.paylinesMatrix[col][row].paylineSymbol.stopAnimation();
            }
        }
    },
    blinkNormalPaylinePerline({payLineID, payLineWinNumbers}) {
        let payline = this.node.config.PAY_LINE_MATRIX[payLineID];
        for (let paylinePos = 0; paylinePos < payLineWinNumbers; ++paylinePos) {
            const row = payline[paylinePos];
            const col = paylinePos;
            this.paylinesMatrix[col][row].symbol.blinkHighlight(this.node.curentConfig.BLINK_DURATION, this.node.curentConfig.BLINKS);
            this.paylinesMatrix[col][row].paylineSymbol.blinkHighlight(this.node.curentConfig.BLINK_DURATION, this.node.curentConfig.BLINKS);
            
        }
    },
    blinkNormalPaylineAllline({symbolId, symbolCount}) {
        for (let col = 0; col < symbolCount; col++) {
            for (let row = 0; row < this.paylinesMatrix[col].length; row++) {
                if (this.paylinesMatrix[col][row].symbol.symbol == symbolId ||
                    this.paylinesMatrix[col][row].symbol.symbol == "K") //remove hardcore K ?
                {
                    this.paylinesMatrix[col][row].symbol.blinkHighlight(this.node.curentConfig.BLINK_DURATION, this.node.curentConfig.BLINKS);
                    this.paylinesMatrix[col][row].paylineSymbol.blinkHighlight(this.node.curentConfig.BLINK_DURATION, this.node.curentConfig.BLINKS);
                }
            }
        }
    },
    showNormalPaylinePerline({payLineID, payLineWinNumbers}) {
        this.disableHighlightNormalPaylines();
        let payline = this.node.config.PAY_LINE_MATRIX[payLineID];
        if (payline && payline.length > 0 && this.paylinesMatrix && this.paylinesMatrix.length > 0){
            for (let paylinePos = 0; paylinePos < payLineWinNumbers; ++paylinePos) {
                const row = payline[paylinePos];
                const col = paylinePos;
                this.paylinesMatrix[col][row].symbol.active = false;
                this.paylinesMatrix[col][row].paylineSymbol.enableHighlight();
                this.paylinesMatrix[col][row].paylineSymbol.playAnimation();

            }
        }
    },
    showNormalPaylineAllLine({symbolId, symbolCount}) {
        this.disableHighlightNormalPaylines();
        for (let col = 0; col < symbolCount; col++) {
            for (let row = 0; row < this.paylinesMatrix[col].length; row++) {
                if (this.paylinesMatrix[col][row].symbol.symbol == symbolId ||
                    this.paylinesMatrix[col][row].symbol.symbol == "K") //remove hardcore K ?
                {
                    this.paylinesMatrix[col][row].symbol.active = false;
                    this.paylinesMatrix[col][row].paylineSymbol.enableHighlight();
                    this.paylinesMatrix[col][row].paylineSymbol.playAnimation();
                }
            }
        }
    },
    showScatterPayLine(callback) {
        this.showSpecialPayline(this.scatterHolderNode, callback);
    },
    showBonusPayLine(callback) {
        this.showSpecialPayline(this.bonusHolderNode, callback);
    },
    showWildPayLine(callback) {
        this.showSpecialPayline(this.wildHolderNode, callback);
    },
    showJackpotPayLine(callback) {
        this.showSpecialPayline(this.jackpotHolderNode, callback);
    },
    showSpecialPayline(node, callback) {
        this.paylineHolderNode.opacity = 255;
        this.disableHighlightNormalPaylines();
        node.forEach((child) => {
            child.symbol.enableHighlight();
            child.symbol.playAnimation();
            child.paylineSymbol.enableHighlight();
            child.paylineSymbol.playAnimation();
        });
        cc.director.getScheduler().schedule(function(){
            node.opacity = 0;
            if (callback && typeof callback == "function") {
                callback();
            }
        }, this, 0, 0, this.node.curentConfig.ANIMATION_DURATION, false);
    },
    clearPaylines() {
        if(this._blinkingCallback){
            this.unschedule(this._blinkingCallback);
            this._blinkingCallback = null;
        }
        this.showingPayline = false;
        this.paylineTime = 0;
        this.resetSymbolPaylines();
        this.paylineHolderNode.removeAllChildren();
        this.paylineHolderNode.active = false;
        this.paylinesMatrix = [];
        this.scatterHolderNode = [];
        this.bonusHolderNode = [];
        this.wildHolderNode = [];
        this.jackpotHolderNode = [];
        this.tablePaylineInfo.emit('HIDE_PAYLINE');
    },
    blinkHighlightPaylines(callback) {
        this._blinkingCallback = ()=>{
            callback && callback();
            this._blinkingCallback = null;
        };
        this.paylineHolderNode.opacity = 255;
        this.disableHighlightNormalPaylines();
        for (let i = 0; i < this.payLineNormals.length; ++i) {
            this.blinkNormalPayline(this.payLineNormals[i]);
        }
        this.node.emit('BLINK_ALL_PAYLINE');
        this.scheduleOnce(this._blinkingCallback, this.node.curentConfig.BLINKS * this.node.curentConfig.BLINK_DURATION);
    },
    update(dt)
    {
        if (this.paylineTime > 0 && this.showingPayline)
        {
            this.paylineTime -= dt;
            if (this.paylineTime <= 0)
            {
                this.showNextPayline();
            }
        }
    },
    showNextPayline()
    {
        this.paylineHolderNode.opacity = 255;
        if (!this.payLineNormals || !this.payLineNormals[this.paylineIndex]) {
            if (this.paylineType === 'free')
            {
                this.showingPayline = false;
            }
            this.paylineIndex = 0;
            this.callbackShowPayline && this.callbackShowPayline();
            this.callbackShowPayline = null;
        }
        if (this.payLineNormals && this.payLineNormals[this.paylineIndex] && this.showingPayline) {
            const paylineInfo = this.payLineNormals[this.paylineIndex];
            this.showNormalPayline(paylineInfo);
            this.tablePaylineInfo.emit('SHOW_PAYLINE',{line: paylineInfo});
            this.extShowPayline();
            this.paylineIndex += 1;
            this.paylineTime = this.nextPaylineTime;
        }
    },
    extShowPayline()
    {

    }
});
