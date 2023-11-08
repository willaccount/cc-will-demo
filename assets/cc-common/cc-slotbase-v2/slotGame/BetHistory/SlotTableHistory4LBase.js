const {formatMoney} = require('utils');
const {convertAssetArrayToObject} = require('utils');

const arrayTypeJackpot = ["MINI","MINOR","MAJOR","GRAND"];

cc.Class({
    extends: require("SlotTableHistory"),

    properties: {
        bonusSprite: {
            type: cc.SpriteFrame,
            default: []
        },
        isShowSpecialPayline: false,
    },

    onLoad() {
        this.bonusSprite = convertAssetArrayToObject(this.bonusSprite);
        
        this._super();

        this.node.on("SHOW_TABLE_MATRIX", this.showTableMatrix, this);
        this.node.on("HIDE_TABLE_MATRIX", this.hideTableMatrix, this);
        this.turnSpecialPayline = false;
    },

    showPaylineAllWay({payLineSymbol, paylineMaxColumn}) {
        let symbolId = payLineSymbol;
        let symbolCount = paylineMaxColumn;
        this.symbolNode.children.forEach((it) => {
            if ((it.val == symbolId || it.val == "K" || (this.currentMode == "free" && it.val == "A1")) && it.col < symbolCount) {
                it.opacity = 255;
            }
            else {
                it.opacity = 100;
            }
        });
    },

    renderResult(data) {
        //data.selectedOption = 2;
        //data.extraData = {"scatterA1":["0;358","10;358"],"scatterA2":["7;1074"],"extraBet":"5;88","scaterA":["1;168","2;68","5;8","6;38","11;38","13;38"]};
        this.typeJackpot = 0;
        this.paylines = [];
        this.listSpecialLine = [];
        this.showingPayline = false;
        this.paylineInfo.emit('HIDE_PAYLINE');
        // selectedOption
        // 1 = FREE8; 2 TOPUP

        this.gameMode = data.mode;
        if (data.mode == "free" && data.selectedOption == 2) {
            this.gameMode = data.mode = "topup";
        } else if (data.mode == "free" && data.selectedOption == 1) {
            this.gameMode = data.mode = "free";
        } else if (data.mode == "bonus") {
            let {latestWinJackpotInfo} = data;
            if (latestWinJackpotInfo) {
                this.typeJackpot = this.getTypeJackpot(latestWinJackpotInfo.jackpotId);
            }
            
            this.gameMode = "bonus";
        }

        this._super(data);

        if (this.listSpecialLine.length > 0) {
            this.showingPayline = true;
        }
        this.paylineTime = 0.02;
    },

    setBonusPayline() {
        // only for 9991
        this.bonusList = [];
        this.symbolNode.children.forEach((it) => {
            if (it.val == "A" || it.val == "A1" || it.val == "A2") {
                this.bonusList.push(it);
            }
        });
    },

    setWildPayline() {
        this.wildJackpotList = [];
        this.symbolNode.children.forEach((it) => {
            if (it.val == "K") {
                this.wildJackpotList.push(it);
            }
        });
    },

    getTypeJackpot(jackpotId) {
        for (let index = 0; index < arrayTypeJackpot.length; index++) {
            const jp = arrayTypeJackpot[index];
            if (jackpotId.includes(jp)) {
                return  (index + 1);
            }
        }
        return 0;
    },

    renderGameTable(matrix, format) {
        let startX = (-format.length/2 + 0.4) * this.node.config.SYMBOL_WIDTH;
        let count = 0;
        for (let i=0; i<format.length; i++) {
            let startY = (format[i]/2 - 0.5) * this.node.config.SYMBOL_HEIGHT + 5;
            for (let j=0; j<format[i]; j++) {
                let symbol = this.getSymbol(this.currentMode);
                symbol.parent = this.symbolNode;
                symbol.setPosition(startX + i * (this.node.config.SYMBOL_WIDTH + 10), startY - j*(this.node.config.SYMBOL_HEIGHT + 10));
                symbol.getComponent("SlotSymbol").changeToSymbol(matrix[count]);
                symbol.col = i;
                symbol.row = j;
                symbol.val = matrix[count];
                symbol.disableNumber();
                count++;
            }
        }
    },


    renderBonusTable(matrix, format) {
        let width = this.node.config.SYMBOL_WIDTH - 14;
        let startX = (-format.length / 2 + 0.5) * width;
        let count = 0;

        for (let i = 0; i < matrix.length; i++) {
            let startY = (format[0] / 2 - 0.5) * this.node.config.SYMBOL_HEIGHT;

            let col = Math.floor(i % 4);
            let row = Math.floor(i / 4);
            let value = parseInt(matrix[count]);

            let displayTypeJackpot = parseInt(value % 10);
            let symbol = this.getSymbol(this.currentMode);
            symbol.parent = this.symbolNode;
            symbol.setPosition(startX + col * width, startY - (row * this.node.config.SYMBOL_HEIGHT));
            symbol.setResult('treasure' + value);

            if (this.typeJackpot == displayTypeJackpot || this.typeJackpot == 0) {
                symbol.opacity = 255;
            } else {
                symbol.opacity = 100;
            }
            count++;
        }
    },

    onNextButton() {
        if (this.currentMode == "free" || this.currentMode == "topup") {
            this.currentFree++;
        }
    },

    onBackButton() {
        this.currentPage = this.currentPage-1;
        if (this.currentMode == "free" || this.currentMode == "topup") {
            this.currentFree = Math.max(0, this.currentFree - 1);
        }
    },

    updateTitle(data) {
        let titleMode = "Normal";
        let winAmount = 0;
        switch (data.mode) {
            case "normal":
                titleMode = "Normal";
                winAmount = data.winAmount;
                break;
            case "free":
                titleMode = "Free";
                winAmount = data.winAmount;
                break;
            case "topup":
                titleMode = "Topup";
                winAmount = data.totalFreeWinAmount;
                break;
            case "bonus":
                titleMode = "Bonus";
                winAmount = data.totalBonusWinAmount;
                break;
        }
        if (this.currentMode == "free") {
            titleMode += " lần " + (this.currentFree + 1);
            titleMode += " : " + formatMoney(winAmount || 0);
        }
        else if (this.currentMode == "topup") {
            titleMode += " lần " + (this.currentFree + 1);
            if (winAmount && winAmount > 0)
                titleMode += " : " + formatMoney(winAmount || 0);
        }

        if (data.latestWinJackpotInfo) {
            titleMode += " Jackpot: " + data.latestWinJackpotInfo.jackpotAmount;
        }
        else if (data.mode == "bonus") {
            titleMode += " : " + formatMoney(winAmount || 0);
        }
        this.title.string = titleMode;
    },

    renderExtendData(data) {
        const {scaterA, scatterA1, scatterA2, lsa8, lsan, lta, bg, opt} = data.extraData;
        let scatterCredit = scaterA.concat(scatterA1).concat(scatterA2);
        
        this.bonusList = [];
        this.wildJackpotList = [];
        this.indexSpecialLine = 0;

        let isBonusPayline = (this.gameMode != "normal"  && (lsa8 > 0 || lsan > 0 || lta > 0)) ||
            (this.gameMode == "normal" && opt);

        if (isBonusPayline) {
            this.setBonusPayline();
            this.listSpecialLine.push("SCATTER");
            this.bonusWinAmount = lsa8 || lsan || lta;
        }

        if (bg) {
            this.listSpecialLine.push("WILD");
            this.setWildPayline();
        }

        let totalCredit = 0;
        for(let i = 0; i < scaterA.length; i++) {
            let data = scaterA[i].split(';');
            let credit = parseInt(data[1]);
            totalCredit += credit;
        }
        if(this.gameMode == 'free') {
            for(let i = 0; i < this.symbolNode.children.length; i++) {
                const symbol = this.symbolNode.children[i];
                // let credit = parseInt(scatterA1[0]);
                if (symbol.val == "A1")
                    symbol.addNumber(totalCredit);
            }
        } else {
            for (let i=0; i < scatterCredit.length; i++) {
                let data = scatterCredit[i].split(';');
                let index = parseInt(data[0]);
                let credit = parseInt(data[1]);
                const symbol = this.symbolNode.children[index];
                if (symbol.val == "A" || symbol.val == "A1" || symbol.val == "A2")
                    symbol.addNumber(credit);
            }
        }
    },

    showNextPayline() {
        /*
        try {
            if (this.turnSpecialPayline) {
                if (this.indexSpecialLine < this.listSpecialLine.length) {
                    if (this.listSpecialLine[this.indexSpecialLine] == "SCATTER") {
                        // show special payline
                        this.showBonusPayline();
                        if (this.gameMode == "free") {
                            this.paylineInfo.emit('SHOW_PAYLINE_BONUS',this.bonusWinAmount, true);
                        } else if (this.gameMode == "topup") {
                            this.paylineInfo.emit('SHOW_PAYLINE_BONUS',this.bonusWinAmount, false);
                        } else {
                            this.paylineInfo.emit('HIDE_PAYLINE');
                        }
                        
                        this.indexSpecialLine++;
                    } else if (this.listSpecialLine[this.indexSpecialLine] == "WILD") {
                        // show special payline
                        this.showWildJackpot();
                        this.paylineInfo.emit('SHOW_WILD_JACKPOT');
                        this.indexSpecialLine++;
                    }
                } else {
                    this.turnSpecialPayline = false;
                }
                this.paylineTime = 2;
                return;
            }
    
            if (this.paylines && this.paylines.length > 0) {
                let paylineInfo = this.paylines[this.paylineIndex];
                if (!paylineInfo.betDenom) paylineInfo.betDenom = this.betDenom;
                if (this.node.config.PAY_LINE_ALLWAYS) {
                    this.showPaylineAllWay(paylineInfo);
                }
                else {
                    this.showPaylinePerline(paylineInfo);
                }
                this.paylineInfo.emit('SHOW_PAYLINE',{line: this.paylines[this.paylineIndex]});
                this.paylineTime = 2;
        
                let isDisplayBonusPayline = this.isShowSpecialPayline && this.listSpecialLine && this.listSpecialLine.length > 0;

                if (this.paylineIndex + 1 == this.paylines.length && isDisplayBonusPayline) {
                    this.turnSpecialPayline = true;
                    this.indexSpecialLine = 0;
                    this.paylineIndex = 0;
                } else {
                    this.paylineIndex = (this.paylineIndex + 1) % this.paylines.length;
                }
            } else if (this.listSpecialLine && this.listSpecialLine.length > 0) {
                this.turnSpecialPayline = true;
                this.indexSpecialLine = 0;
                this.paylineTime = 0.02;
            }
            
        } catch (exception) {
            // change next page but this called by update
        }
        */
    },

    showBonusPayline() {
        // only for 9991
        if (this.bonusList && this.bonusList.length > 0) {
            this.symbolNode.children.forEach(it => {
                it.opacity = 100;
            });
            for (let i = 0; i < this.bonusList.length; i++) {
                let symbol = this.bonusList[i];
                if (symbol) symbol.opacity = 255;
            }
        }
    },

    showWildJackpot() {
        // only for 9991
        if (this.wildJackpotList && this.wildJackpotList.length > 0) {
            this.symbolNode.children.forEach(it => {
                it.opacity = 100;
            });
            for (let i = 0; i < this.wildJackpotList.length; i++) {
                let symbol = this.wildJackpotList[i];
                if (symbol) symbol.opacity = 255;
            }
        }
    },

    update() {
    },

    clearPayline() {
        if (this.gameMode != "bonus") {
            this.symbolNode.children.forEach(it => it.opacity = 255);
        }
    },

    showTableMatrix() {
        this.node.opacity = 255;
    },

    hideTableMatrix() {
        this.node.opacity = 0;
    },
});
