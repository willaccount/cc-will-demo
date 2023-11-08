const {convertAssetArrayToObject} = require('utils');
const lodash = require('lodash');
cc.Class({
    extends: cc.Component,

    properties: {
        display : cc.Node,
        phase1: cc.Label,
        symbol: cc.Sprite,
        phase2: cc.Label,
        imageList: [cc.SpriteFrame],
        textList: cc.JsonAsset,
    },

    onLoad(){
        if (this.node.config.SHOW_INTRO_TIPS) {
            this.node.on("SHOW_INTRO",this.showRandomIntro.bind(this),this);
            this.node.on("HIDE_INTRO",this.hideIntro.bind(this),this);
        }
        this.specSymbols = [];
        this.imageList.forEach(it=>{this.specSymbols.push(it.name);});
        this.loadTextFromFile();
    },

    loadTextFromFile() {
        if (this.textList && this.textList.json.data) {
            this.node.config.INTRO_GAME_PLAY = this.textList.json.data;
        }
    },

    start() {
        this.curIndex = 0;
        this.node.opacity = 1;
        this.display.opacity = 1;
        this.speed = 200;
        this.isFirstShow = true;
        this.assets = convertAssetArrayToObject(this.imageList);
        if (this.node.config.SHOW_INTRO_TIPS) {
            this.scheduleOnce(()=>{
                this.node.opacity = 255;
                this.showRandomIntro();
            },1);
        }
    },

    showIntro() {
        this.display.opacity = 255;    
    },

    showRandomIntro(){
        this.node.stopAllActions();
        this.display.stopAllActions();

        const destination = new cc.Vec2(-this.node.width/2,0);
        this.node.runAction(cc.sequence(
            cc.callFunc(()=>{
                this.reset();
                this.parseString(this.node.config.INTRO_GAME_PLAY[this.curIndex]);
                this.curIndex = (this.curIndex + 1) % this.node.config.INTRO_GAME_PLAY.length;
                
            }),
            cc.delayTime(2),
            cc.callFunc(()=>{
                this.showIntro();
                const center = (this.display.width - this.node.width) / 2;
                this.display.x = this.display.width - this.node.width > 0 ? center : 0;
            }),
            cc.delayTime(2),
            cc.callFunc(()=>{
                const distance = this.display.width + this.node.width / 2;
                const street  = Math.abs(destination.x - distance) ;
                let time = street / this.speed ;
                if (street > this.node.width/2) {
                    this.display.runAction(cc.sequence(
                        cc.moveBy(time, -street, 0),
                        cc.callFunc(()=>{
                            this.showRandomIntro();
                        }),
                    ));
                } else {
                    this.display.runAction(cc.sequence(
                        cc.delayTime(time),
                        cc.callFunc(()=>{
                            this.showRandomIntro();
                        }),
                    ));
                }
                this.isFirstShow = false;
            }),
        ));
    },

    parseString(str = ""){
        let arrStr = str.split(' ');
        let groupStr = [];
        let runIndex = 0;
        let indexGroup = 0;
        let phase = '';
        while(runIndex < arrStr.length) {
            const element = arrStr[runIndex];
            let symbol  = this.findSpecialSymbol(element);
            if (symbol == null) {
                let space = (runIndex === arrStr.length - 1) ? '' : " ";
                phase += element + space;
                groupStr[indexGroup] = {phase : phase, symbol : null};
            } else {
                indexGroup++;
                groupStr[indexGroup] = {phase : element, symbol : symbol};
                phase = '';
                indexGroup++;
            }
            runIndex++;
        }
        groupStr = groupStr.filter(it=> it != null);
        this.display.removeAllChildren();
        groupStr && groupStr.forEach(it=>{
            if (lodash.isEqual(it.symbol, null)){
                this.addStrToTips(it.phase);
            } else {
                this.addStrToTips("   ");
                this.addSpriteToTips(it.symbol);
                this.addStrToTips("   ");
            }
        });
        this.display.getComponent(cc.Layout).updateLayout();
    },

    addStrToTips(str = ''){
        const tem = cc.instantiate(this.phase1.node);
        tem.getComponent(cc.Label).string = str;
        this.display.addChild(tem);
    },

    addSpriteToTips(symbol){
        const tem = cc.instantiate(this.symbol.node);
        tem.getComponent(cc.Sprite).spriteFrame = this.assets[symbol];
        this.display.addChild(tem);
    },

    findSpecialSymbol(str = ""){
        let found = -1;
        this.specSymbols.forEach((it,index)=>{
            let sym = '[' + it + ']';
            if (lodash.isEqual(sym, str)) found = index;
        });
        return (found != -1) ? this.specSymbols[found] : null;
    },

    reset(){
        this.display.opacity = 0;
        this.phase1.string = "";
        this.symbol.spriteFrame = null;
        this.phase2.string = "";
    },

    hideIntro(){
        this.node.stopAllActions();
        this.display.stopAllActions();
        this.node.active = false;
    },

    onDestroy(){
        this.unscheduleAllCallbacks();
        this.node.stopAllActions();
        this.display.stopAllActions();
        if (this.node.config.SHOW_INTRO_TIPS) {
            this.node.off("SHOW_INTRO",this.showRandomIntro.bind(this),this);
            this.node.off("HIDE_INTRO",this.hideIntro.bind(this),this);
        }
    }
});
