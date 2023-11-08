

const { showScoreOnScreen } = require('globalAnimationLibrary');
const {convertAssetArrayToObject} = require('utils');

cc.Class({
    extends: cc.Component,

    properties: {
        itemPrefab: cc.Prefab,
        scorePrefab: cc.Prefab,
        treasures: {
            default: [],
            type: cc.SpriteFrame,
        }
    },
    onLoad() {
        this.node.mainComponent = this;
        this.assets = convertAssetArrayToObject(this.treasures);
    },

    createMiniGame(data, callbackMiniGame) {
        this.removeAllNode();
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            for (let j = 0; j < row.length; j++) {
                const dataClick = {row: i + 1, col: j + 1};
                // const x = j * 270 - 680 + j * 17;
                // const y = 140 - 250 * i;
                const x = j * 336;
                const y = i * (-240);
                
                const newItems = cc.instantiate(this.itemPrefab);
                newItems.parent = this.node;
                newItems.mainComponent.init({
                    data: dataClick,
                    callbackMiniGame,
                    itemValue: row[j]
                });
                newItems.setPosition(x, y);
                newItems.opacity = 0;
                newItems.runAction(cc.fadeIn(0.2));
                this.itemTreasure[(i + 1) + '' + (j + 1)] = newItems;
                newItems.mainComponent.initLoopingAnimation();
            }
        }
    },
    getCurrentNode(data) {
        const {row, col} = data.node;
        return this.itemTreasure[row + '' + col];
    },

    rewriteSprite(data, callback) {
        const {node: {row, col}, bonus, count} = data;
        const spriteFrame = this.assets['treasure' + bonus];
        this.itemTreasure[row + '' + col].mainComponent.replaceSpriteFrame(spriteFrame, bonus, this.assets, count, (score, currentSymbol) => { 
            this.showScore(score, currentSymbol, 0, .7, callback);
        });
    },
    removeAllNode() {
        this.itemTreasure = {};
        this.node.removeAllChildren();
    },
    showScore(score, itemNode, delay, dur, callback) {
        const miniGameLayout = this.node.parent;
        const moneyFrame = miniGameLayout.getChildByName("MoneyFrame");
        const rate = miniGameLayout.getChildByName("MoneyFrame").getChildByName("Rate");
        const bonus = itemNode.currentSymbol.getChildByName("Bonus");

        const startX = this.node.x + itemNode.x + bonus.x;
        const startY = this.node.y + itemNode.y + bonus.y + 25;
        const endX = moneyFrame.x + rate.x + rate.width / 2;
        const endY = moneyFrame.y + rate.y;

        showScoreOnScreen(miniGameLayout, this.scorePrefab, { "delay": delay, "dur": dur, "score": score, "startX": startX, "startY": startY, "endX": endX, "endY": endY });
    
        if (callback && typeof callback == "function") {
            callback();
        }
    }
});
