

const { tweenObject } = require('globalAnimationLibrary');

cc.Class({
    extends: cc.Component,

    properties: {
        symbolPrefab: cc.Prefab,
    },

    onLoad() {
        this.node.mainComponent = this;
    },

    init() {
        const {data, callbackMiniGame, itemValue } = arguments[0];
        const symbol = this.createSymbol(this.symbolPrefab);
        symbol.parent = this.node;
        this.itemValue = itemValue;
        const scriptItem = symbol.getComponent('gSlotMiniGameScript');
        scriptItem.attachEvent(data, callbackMiniGame);
        this.currentSymbol = symbol;

        return symbol;
    },

    createSymbol() {
        let symbol = cc.instantiate(this.symbolPrefab);
        // const item = symbol.getChildByName('Treasure');
        // symbol.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        return symbol;
    },

    initLoopingAnimation() {
        const lightEff = this.currentSymbol.getChildByName('LightEff');
        const treasureLit = this.currentSymbol.getChildByName('TreasureLit');
        const dur = .3;
        const easing = cc.easeBackInOut();
        
        treasureLit.initY = treasureLit.y;
        const repeater = cc.repeatForever(cc.sequence(
            new cc.DelayTime(Math.random()),
            cc.moveTo(dur, cc.v2(treasureLit.x, treasureLit.y + 5)).easing(easing),
            cc.moveTo(dur, cc.v2(treasureLit.x, treasureLit.initY)).easing(easing)
        ));
        treasureLit.runAction(repeater);

        //
        this.lightingInterVal = setInterval(() => {
            lightEff.getChildByName('light').angle -= .2;
        }, 60 / 100); 
    },

    replaceSpriteFrame(spriteFrame, bonus, assets, count,callback) {
        this.itemValue = bonus;
       
        const treasureLit = this.currentSymbol.getChildByName('TreasureLit');
        // const treasureTop = this.currentSymbol.getChildByName('TreasureTop');
        const bonusNode = this.currentSymbol.getChildByName('Bonus');
        const lightEff = this.currentSymbol.getChildByName('LightEff');
        const particalEff = this.currentSymbol.getChildByName('ParticalEff');
        const score = this.currentSymbol.getChildByName('Score');
        

        let dur = .3;
        const easing = cc.easeSineOut();
        
        score.getComponent(cc.Sprite).spriteFrame = assets['miniGame-' + bonus];
        score.active = true;

        
        lightEff.active = true;
        lightEff.getChildByName('light').getComponent(cc.Sprite).spriteFrame = assets['LIGHT-' + bonus];

        bonusNode.scaleX = bonusNode.scaleY = .5;
        bonusNode.active = true;
        bonusNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;

        treasureLit.stopAllActions();
        this.isShowScore = false;

        if (bonus && count <= 3) {
            this.isShowScore = true;
            score.scaleX = score.scaleY = 0;
            tweenObject(lightEff, { "dur": dur, "dy": 150, "scale": 1, "easing": easing });
            tweenObject(treasureLit, { "dur": dur, "dx": 180, "dy": 260, "rotate": -30, "opacity": 0, "easing": easing });
            tweenObject(score, { "dur": dur, "delay": .1, "scale": 1, "easing": cc.easeBackOut() });
        } else {
            dur = 0;
            this.stopAllAnimation();
            particalEff.destroy();
            treasureLit.destroy();
            lightEff.destroy();
            this.currentSymbol.opacity = 140;
        }

        tweenObject(bonusNode, {"dur": dur, "dy": 60, "scale": 1, "easing": easing, "callback": () => {
            if (this.isShowScore) {
                if (callback && typeof callback === 'function') {
                    callback(bonus,this);
                }
            }
        }});
    },

    replaceWithText(bonus) {
        this.itemValue = bonus;
        if (bonus) {
            this.currentSymbol.getComponent(cc.Sprite).spriteFrame = null;
            this.currentSymbol.getChildByName('LabelNumber').getComponent(cc.Label).string = bonus;
        }
    },

    stopAllAnimation() {
        if (this.lightingInterVal !== undefined) {
            clearInterval(this.lightingInterVal);
        }
    },
});
