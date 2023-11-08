const { isNumber } = require("lodash");
const { formatMoney } = require("utils");

const DescriptionFeature = [
    "Huyền Vũ thực hiện kỹ năng Địa Liệt",
    "Loại bỏ tất cả các biểu tượng phổ thông",
    "Thanh Long thực hiện kỹ năng Chân Long Chúc Phúc",
    "Tặng 4 Wild Thái Cực",
    "Bạch Hổ thực hiện kỹ năng Nộ Phác",
    "Đổi biểu tượng tại các vị trí được đánh dấu",
    "Chu Tước thực hiện kỹ năng Hỏa Dực Phần Thiên",
    "Chuyển đổi tất cả các biểu tượng phổ thông thành đặc biệt",
    "Mở phong ấn Huyền Vũ",
    "Mở phong ấn Thanh Long",
    "Mở phong ấn Bạch Hổ",
    "Mở phong ấn Chu Tước",
    "Thắng Jackpot",
];

const convertPayLine = (payLines = []) => {
    const listNewPL = [];
    const dataSplit = payLines.replace("[", "").replace("]", "").split(' ');

    for (let i = 0; i < dataSplit.length; i++) {
        let data = dataSplit[i].split(';');
        if (data.length < 4) break;

        let symbolID = data[0];
        let payLinePositions = data[1].split(',');
        // payLinePositions: data[1].split(',').map(item => item.trim()),

        let payLineWinAmount = Number(data[2]);
        let symbolCount = Number(data[3].replace(',', ""));

        listNewPL.push({
            symbolID: symbolID,
            payLinePositions: payLinePositions,
            payLineWinAmount: payLineWinAmount,
            symbolCount: symbolCount
        });
    }
    return listNewPL;
};

cc.Class({
    extends: cc.Component,

    properties: {
        sessionLabel: cc.Label,
        betAmountLabel: cc.Label,
        winAmountLabel: cc.Label,

        table: require("SlotTableHistory"),

        pageLabel: cc.Label,
        iconFeature: cc.Sprite,
        featureSpriteFrames: [cc.SpriteFrame],
        activedFeatureSpriteFrames: [cc.SpriteFrame],
        //progress bar
        progressBarFeature: cc.Node,
        progressFeatureValue: cc.Node,

        betHistoryPaylines: cc.Node,

        //feature group
        featureGroup: cc.Node,
        spriteActivedFeature: cc.Node,
        descriptionActivedFeature: cc.Node,
    },

    onLoad() {
        this.node.updateData = this.updateData.bind(this);
        this.node.hideInfoDetailPage = this.hideInfoDetailPage.bind(this);
    },

    hideInfoDetailPage() {
        this.table.node.opacity = 0;
        this.featureGroup.opacity = 0;

        this.sessionLabel.string = "";
        this.betAmountLabel.string = "";
        this.winAmountLabel.string = "";
        this.pageLabel.string = "";

        this.featureGroup.active = false;
        this.betHistoryPaylines.active = false;
    },

    updateData(data, summaryData, extendData) {
        const lastJP = data.latestWinJackpotInfo && data.latestWinJackpotInfo[0];
        
        let { currentPage, totalPages, lastedNumberWinFeatures } = extendData;
        let { numberWinFeatures, usingFeature } = data.result;
        this.progressBarFeature.emit('UPDATE_DATA_FEATURE', data.result.configFeature);
        this.sessionLabel.string = summaryData.sessionId;
        this.betAmountLabel.string = data.mode === "free" ? 0 : formatMoney(data.totalBetAmount);
        this.winAmountLabel.string = lastJP ? formatMoney(lastJP.jackpotAmount + data.winAmount) : formatMoney(data.winAmount);

        this.pageLabel.string = "Lượt " + (currentPage + 1).toString() + "/" + totalPages;
        this.progressBarFeature.opacity = 255;
        let wonSymbolTotal = data.result.totalWinSymbol;
        let maxSymbol = 0;
        data.result.configFeature.forEach(item =>{
            const numSymbols = parseInt(item.split(';')[1]);
            if (numSymbols > maxSymbol) maxSymbol = numSymbols;
        });
        wonSymbolTotal = wonSymbolTotal >= maxSymbol ? maxSymbol : wonSymbolTotal;
        if (wonSymbolTotal != undefined && isNumber(wonSymbolTotal)) {
            this.progressBarFeature.emit("UPDATE_STATIC_PROGRESS_BAR", {wonSymbolTotal});
            this.progressFeatureValue.getComponent(cc.Label).string = this.progressBarFeature.getCurrentProgressText(wonSymbolTotal);
        }


        if (numberWinFeatures) {
            if (numberWinFeatures == 4) {
                this.iconFeature.node.width = 130;
                this.iconFeature.node.height = 130;
            } else {
                this.iconFeature.node.width = 80;
                this.iconFeature.node.height = 80;
            }
            this.iconFeature.spriteFrame = this.featureSpriteFrames[numberWinFeatures];
        } else {
            this.iconFeature.node.width = 80;
            this.iconFeature.node.height = 80;
            this.iconFeature.spriteFrame = this.featureSpriteFrames[0];
        }
        
        this.table.renderResult(data);
        // must renderResult matrix first
        if (usingFeature && usingFeature > 0) {
            this.featureGroup.active = true;
            this.betHistoryPaylines.active = false;
            this.table.applyFeature(usingFeature);

            if (usingFeature == 4) this.spriteActivedFeature.scale = 0.45;
            else this.spriteActivedFeature.scale = 0.5;

            this.spriteActivedFeature.getComponent(cc.Sprite).spriteFrame = this.activedFeatureSpriteFrames[usingFeature -1];
            this.descriptionActivedFeature.getComponent(cc.Label).string = DescriptionFeature[(usingFeature - 1) * 2] + "\n" + DescriptionFeature[(usingFeature - 1) * 2 + 1];

        } else {
            this.featureGroup.active = false;
            this.betHistoryPaylines.active = true;
            
            let paylines = convertPayLine(data.paylines);
            if (paylines && paylines.length > 0) this.table.highlightPaylines(paylines);
            else this.table.highlightPaylines([]);
            if (lastJP) paylines.push({symbolID : "JP", payLineWinAmount : lastJP.jackpotAmount});
            this.betHistoryPaylines.emit("UPDATE_DATA", paylines, { numberWinFeatures, lastedNumberWinFeatures });
        }
        this.iconFeature.node.active = (data.result.totalWinSymbol <= maxSymbol || lastJP != null);
        // show
        this.table.opacity = 255;
        this.featureGroup.opacity = 255;
    },
});
