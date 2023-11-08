

const {convertAssetArrayToObject} = require('utils');
const {formatMoney} = require('utils');

cc.Class({
    extends: cc.Component,

    properties: {
        smallSymbolPrefix: "symbol_small_",
        smallSymbols: {
            type: cc.SpriteFrame,
            default: [],
        },
        lbLeft:{
            type: cc.Label,
            default: null
        },
        lbRight:{
            type: cc.Label,
            default: null
        },
        imgSymbol:{
            type: cc.Sprite,
            default: null
        }
    },
    onLoad () {
        this.assets = convertAssetArrayToObject(this.smallSymbols);
        if (this.node.config && this.node.config.PAY_LINE_ALLWAYS)
            this.showPaylineInfo = this.showPaylineInfoAllways;
        else if (!this.showPaylineInfo) {
            this.showPaylineInfo = this.showPaylineInfoLine;
        }
    },
    start() {
        this.node.on("SHOW_PAYLINE",this.showPaylineInfo,this);
        this.node.on("HIDE_PAYLINE",this.hidePaylineInfo,this);
        this.hidePaylineInfo();
        this.localizeText();
    },
    localizeText() {
        this.winText = `thắng`;
        if (this.node.config && this.node.config.GAME_TEXT) {
            this.winText = this.node.config.GAME_TEXT.WIN_TEXT_1;
        }
    },
    showPaylineInfoLine({line}){
        const {payLineID, payLineWinNumbers, payLineWinAmount, payLineSymbol} = line;
        
        this.lbLeft.string = `Line ${payLineID} ${this.winText} ` + payLineWinNumbers + " x";
        this.lbRight.string = " = " + formatMoney(payLineWinAmount) + "";
        this.imgSymbol.getComponent(cc.Sprite).spriteFrame = this.assets[this.smallSymbolPrefix + payLineSymbol];
        this.node.active = true;
    },
    showPaylineInfoAllways({line}){
        const {symbolId, totalWinAmount, symbolCount, combination, payableSymbol} = line;
        const betDenom = this.calculateBetDenom();
        
        this.lbLeft.string = Number(symbolCount);
        this.imgSymbol.getComponent(cc.Sprite).spriteFrame = this.assets[this.smallSymbolPrefix + symbolId];

        const symbolPayTableString = `${this.winText} ` + payableSymbol;
        const combinationString = combination > 1 ? ' (x' + combination + ')' : '';
        const calculateDenom = ' = ' + formatMoney((payableSymbol * combination))+ ' xu x ' + formatMoney(betDenom) + ' = ';
        const winAmount = formatMoney(totalWinAmount) + 'đ';
        this.lbRight.string = symbolPayTableString + combinationString + calculateDenom + winAmount;
        this.node.active = true;
    },
    calculateBetDenom() {
        const {steps} = this.node.gSlotDataStore.slotBetDataStore.data;
        const {TOTAL_BET_CREDIT} = this.node.config;
        const betIds = this.node.gSlotDataStore.playSession.betId;
        const betIndex = Object.keys(steps).find(key => key == betIds[0]);
        return Number(steps[betIndex]) / TOTAL_BET_CREDIT;
    },
    hidePaylineInfo(){
        this.node.active = false;
    }
});
