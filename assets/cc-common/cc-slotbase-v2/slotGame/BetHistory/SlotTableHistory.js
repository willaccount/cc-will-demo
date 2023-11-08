const { formatWalletMoney } = require('utils');

cc.Class({
    extends: cc.Component,

    properties: {
        freeGame: cc.Node,
        normalGame: cc.Node,
        bonusGame: cc.Node,
        topupGame: cc.Node,
        symbolNode: cc.Node,
        symbolPrefab: cc.Prefab,
        symbolBonus: cc.Prefab,
        scaleRate: 1,
        scaleNode: cc.Node,
        paylineInfo: cc.Node,
        isFormatMatrix: false
    },

    onLoad() {
        this.symbolPool = new cc.NodePool("SymbolPool");
        this.bonusPool = new cc.NodePool("BonusPool");
        this.bonusPositions = this.bonusGame ? this.bonusGame.getChildByName("Position") : null;
        this.currentFree = 0;
        this.paylineTime = 2;
    },

    setFreePage(page) {
        this.currentFree = page;
    },

    renderResult(data) {
        this.normalGame.active = false;
        this.freeGame.active = false;
        if (this.bonusGame) this.bonusGame.active = false;
        if (this.topupGame) this.topupGame.active = false;
        this.clearTable();
        this.betDenom = data.betDenom;
        this.currentMode = data.mode;
        this.martrixFormat = data.matrixFormat;
        switch (data.mode) {
            case "normal":
                this.normalGame.active = true;
                this.renderGameTable(data.matrixResult, data.matrixFormat);
                this.renderExtendData(data);
                this.scaleNode.scale = this.scaleRate;
                break;
            case "free":
                this.freeGame.active = true;
                this.renderGameTable(data.matrixResult, data.matrixFormat);
                this.renderExtendData(data);
                this.scaleNode.scale = this.scaleRate;
                break;
            case "bonus":
                this.bonusGame.active = true;
                this.renderBonusTable(data.matrixResult, data.matrixFormat, data.betDenom, data.bettingLines);
                this.renderExtendBonusData(data);
                this.scaleNode.scale = this.scaleRate;
                break;
            case "topup":
                if (this.topupGame) {
                    this.topupGame.active = true;
                    this.renderGameTable(data.matrixResult, data.matrixFormat);
                    this.renderExtendData(data);
                    this.scaleNode.scale = this.scaleRate;
                }
                break;
        }
    },

    renderGameTable(matrix, format) {
        let startX = (-format.length / 2 + 0.5) * this.node.config.SYMBOL_WIDTH;
        let count = 0;
        for (let i = 0; i < format.length; i++) {
            let startY = (format[i] / 2 - 0.5) * this.node.config.SYMBOL_HEIGHT;
            for (let j = 0; j < format[i]; j++) {
                let symbol = this.getSymbol(this.currentMode);
                symbol.parent = this.symbolNode;
                symbol.setPosition(startX + i * this.node.config.SYMBOL_WIDTH, startY - j * this.node.config.SYMBOL_HEIGHT);
                symbol.changeToSymbol(matrix[count]);
                symbol.col = i;
                symbol.row = j;
                symbol.val = matrix[count];
                count++;
            }
        }
    },

    renderExtendData() {
    },
    renderExtendBonusData() {
    },

    renderBonusTable(matrix, format, denom, totalLines) {
        let startX = (-format.length / 2 + 0.5) * this.node.config.SYMBOL_WIDTH;
        let count = 0;
        for (let i = 0; i < format.length; i++) {
            let startY = (format[i] / 2 - 0.5) * this.node.config.SYMBOL_HEIGHT;
            for (let j = 0; j < format[i]; j++) {
                let symbol = this.getSymbol(this.currentMode);
                symbol.parent = this.symbolNode;
                symbol.setPosition(startX + i * this.node.config.SYMBOL_WIDTH, startY - j * this.node.config.SYMBOL_HEIGHT);
                symbol.unOpen();
                let credit = parseInt(matrix[count]);
                let value = credit * Number(denom) * Number(totalLines);
                if (value >= 0)
                    symbol.setScore(formatWalletMoney(value));
                if (this.bonusPositions && this.bonusPositions.children[count]) {
                    symbol.setPosition(this.bonusPositions.children[count].position);
                }
                count++;
            }
        }
    },

    /*showNextPayline() {
        let paylineInfo = this.paylines[this.paylineIndex];
        if (!paylineInfo.betDenom) paylineInfo.betDenom = this.betDenom;
        if (this.node.config.PAY_LINE_ALLWAYS) {
            this.showPaylineAllWay(paylineInfo);
        }
        else {
            this.showPaylinePerline(paylineInfo);
        }
        this.paylineInfo.emit('SHOW_PAYLINE',{line: this.paylines[this.paylineIndex]});
        this.paylineIndex = (this.paylineIndex + 1) % this.paylines.length;
        this.paylineTime = 2;
    },*/

    showPaylinePerline({ payLineID, payLineWinNumbers }) {
        let payline = this.node.config.PAY_LINE_MATRIX[payLineID];
        let count = 0;
        this.symbolNode.children.forEach(it => {
            it.opacity = 100;
        });
        for (let i = 0; i < payLineWinNumbers; i++) {
            let symbol = this.symbolNode.children[count + payline[i]];
            if (symbol) symbol.opacity = 255;
            count += this.martrixFormat[i];
        }
    },

    showPaylineAllWay({ symbolId, symbolCount }) {
        this.symbolNode.children.forEach((it) => {
            if (it.val == symbolId && it.col < symbolCount) {
                it.opacity = 255;
            } else {
                it.opacity = 100;
            }
        });
    },

    clearPayline() {
        this.symbolNode.children.forEach(it => it.opacity = 255);
    },

    /*update(dt) {
        if (this.paylineTime > 0 && this.showingPayline)
        {
            this.paylineTime -= dt;
            if (this.paylineTime <= 0)
            {
                this.showNextPayline();
            }
        }
    },*/

    clearTable() {
        let pool = this.symbolPool;
        if (this.currentMode == "bonus") pool = this.bonusPool;
        this.showingPayline = false;
        while (this.symbolNode.children.length > 0) {
            pool.put(this.symbolNode.children[0]);
        }
        this.paylineInfo.emit('HIDE_PAYLINE');
    },

    getSymbol(type) {
        let pool = this.symbolPool;
        let prefab = this.symbolPrefab;
        if (type == "bonus") {
            pool = this.bonusPool;
            prefab = this.symbolBonus;
        }
        let result = pool.get();
        if (!result) {
            result = cc.instantiate(prefab);
        }
        return result;
    },

});
