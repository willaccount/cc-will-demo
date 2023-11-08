

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
        this.node.on("SETUP_PAYLINES",this.setupPaylines,this);
        this.node.on("BLINK_ALL_NORMAL_PAYLINES",this.blinkHighlightPaylines,this);
        this.node.on("SHOW_ALL_NORMAL_PAYLINES",this.showAllNormalPayLines,this);
        this.node.on("SHOW_SCATTER_PAYLINE",this.showScatterPayLine,this);
        this.node.on("SHOW_BONUS_PAYLINE",this.showBonusPayLine,this);
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

        for (let col = 0; col < this.node.reels.length; ++col) {
            this.paylinesMatrix[col] = [];
            for (let row = 1; row < this.node.reels[col].showSymbols.length - 1; ++row) {
                const symbol = this.node.reels[col].showSymbols[row];
                const paylineSymbol = this.createPaylineSymbol(this.node.reels[col],symbol.symbol, col, row);
                const payline = {
                    symbol, paylineSymbol,
                };
                this.paylinesMatrix[col][row-1] = payline;
                if (symbol.symbol == "A") {
                    this.scatterHolderNode.push(payline);
                } else if (symbol.symbol == "R") {
                    this.bonusHolderNode.push(payline);
                } else if (symbol.symbol == "K") {
                    this.wildHolderNode.push(payline);
                }
            }
        }

        this.paylineHolderNode.opacity = 0;
    },
    getXPosition(index) {
        return (this.node.config.SYMBOL_WIDTH + this.node.config.SYMBOL_MARGIN_RIGHT) * index + this.node.config.SYMBOL_WIDTH/2;
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
        paylineSymbol.y = (reel.showNumber - row + 1) * this.node.config.SYMBOL_HEIGHT - this.node.config.SYMBOL_HEIGHT/2 - (reel.showNumber - 3)*this.node.config.SYMBOL_HEIGHT/2;
        paylineSymbol.disableHighlight();
        return paylineSymbol;
    },
    
    //Show each line for ANIMATION_DURATION time
    showAllNormalPayLines(index = 0) {
        this.paylineHolderNode.opacity = 255;
        if (!this.payLineNormals[index]) {
            index = 0;
        }
        const { payLineID, payLineWinNumbers} = this.payLineNormals[index];
        
        this.showNormalPayline(payLineID, payLineWinNumbers);

        this.tablePaylineInfo.emit('SHOW_PAYLINE',{line: this.payLineNormals[index]});
        //Recursive time, do we need to? or just use action sequence???
        if (this.timeoutPayLine){
            clearTimeout(this.timeoutPayLine);
        }
        this.timeoutPayLine = setTimeout(() => {
            this.showAllNormalPayLines(++index);
        }, this.node.curentConfig.ANIMATION_DURATION * 1000);
    },
    resetSymbolPaylines() {
        for (let col = 0; col < this.paylinesMatrix.length; ++col) {
            for (let row = 0; row < this.paylinesMatrix[col].length; ++row) {
                this.paylinesMatrix[col][row].symbol.reset();
                this.paylinesMatrix[col][row].paylineSymbol.reset();
            }
        }
    },
    disableHighlightNormalPaylines() {
        for (let col = 0; col < this.paylinesMatrix.length; ++col) {
            for (let row = 0; row < this.paylinesMatrix[col].length; ++row) {
                this.paylinesMatrix[col][row].symbol.disableHighlight();
                this.paylinesMatrix[col][row].symbol.stopAnimation();
                this.paylinesMatrix[col][row].paylineSymbol.disableHighlight();
                this.paylinesMatrix[col][row].paylineSymbol.stopAnimation();
            }
        }
    },
    blinkNormalPayline(payLineID, payLineWinNumbers) {
        let payline = this.node.config.PAY_LINE_MATRIX[payLineID];
        for (let paylinePos = 0; paylinePos < payLineWinNumbers; ++paylinePos) {
            const row = payline[paylinePos];
            const col = paylinePos;
            this.paylinesMatrix[col][row].symbol.blinkHighlight(this.node.curentConfig.BLINK_DURATION, this.node.curentConfig.BLINKS);
            this.paylinesMatrix[col][row].paylineSymbol.blinkHighlight(this.node.curentConfig.BLINK_DURATION, this.node.curentConfig.BLINKS);
            
        }
    },
    showNormalPayline(payLineID, payLineWinNumbers) {
        this.disableHighlightNormalPaylines();
        let payline = this.node.config.PAY_LINE_MATRIX[payLineID];
        if (payline && payline.length > 0 && this.paylinesMatrix && this.paylinesMatrix.length > 0){
            for (let paylinePos = 0; paylinePos < payLineWinNumbers; ++paylinePos) {
                const row = payline[paylinePos];
                const col = paylinePos;
                this.paylinesMatrix[col][row].symbol.enableHighlight();
                this.paylinesMatrix[col][row].symbol.playAnimation();
                this.paylinesMatrix[col][row].paylineSymbol.enableHighlight();
                this.paylinesMatrix[col][row].paylineSymbol.playAnimation();

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
        if (this.timeoutPayLine){
            clearTimeout(this.timeoutPayLine);
        }
        this.resetSymbolPaylines();
        this.paylineHolderNode.removeAllChildren();
        this.paylineHolderNode.active = false;
        this.paylinesMatrix = [];
        this.scatterHolderNode = [];
        this.bonusHolderNode = [];
        this.wildHolderNode = [];
        this.tablePaylineInfo.emit('HIDE_PAYLINE');
    },
    onDestroy() {
        clearTimeout(this.timeoutPayLine);
    },
    onDisable() {
        if (this.timeoutPayLine){
            clearTimeout(this.timeoutPayLine);
        }
    },
    blinkHighlightPaylines(callback) {
        this.paylineHolderNode.opacity = 255;
        this.disableHighlightNormalPaylines();
        for (let i = 0; i < this.payLineNormals.length; ++i) {
            const { payLineID, payLineWinNumbers} = this.payLineNormals[i];
            this.blinkNormalPayline(payLineID, payLineWinNumbers);
        }
        this.node.emit('BLINK_ALL_PAYLINE');
        cc.director.getScheduler().schedule(callback, this, 0, 0, this.node.curentConfig.BLINKS * this.node.curentConfig.BLINK_DURATION, false);
    },
});
