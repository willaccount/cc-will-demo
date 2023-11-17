const lodash = require('lodash');

const OPTION = [0, 1, 2, 3, 4, 5];
const SPIN_AMOUNT = {
    "25" : 0,
    "20" : 1,
    "15" : 2,
    "13" : 3,
    "10" : 4,
    "6" : 5
}

cc.Class({
    extends: require('SlotReelv2'),

    properties: {
        symbolPrefab: cc.Prefab,
        amountSymbolDisplay: 1,
        isMultiplierReel: false,
    },

    onLoad() {
        this._super();

        this.node.on("START_REEL_SPINNING", this.startSpinning.bind(this));
        this.node.on("STOP_REEL_SPINNING", this.stopSpinning.bind(this));

        if (this.node.config) {
            this.init(this.node.config);
        }
    },

    init(gameConfig) {
        this.config = gameConfig;
        this.optionList = OPTION;
        this.showNumber = 1;
        this.totalNumber = this.amountSymbolDisplay + this.config.TABLE_SYMBOL_BUFFER.TOP + this.config.TABLE_SYMBOL_BUFFER.BOT;
        this.symbolStartY = -1 * (this.config.TABLE_SYMBOL_BUFFER.BOT * this.config.SYMBOL_MYTHICAL_HEIGHT);
        this.symbols = [];
        for (let i = 0; i < this.totalNumber; ++i) {
            const symbol = cc.instantiate(this.symbolPrefab);
            symbol.name = "Symbol_" + i;
            symbol.parent = this.reel;
            symbol.setPosition(0, this.symbolStartY + i * this.config.SYMBOL_MYTHICAL_HEIGHT);
            symbol.getComponent("SymbolOptions8983").changeToSymbol(i);
            this.symbols.push(symbol);
        }
        this.mode = 'FAST';
        this.index = 0;
        this.curentConfig = this.config.STATS[this.mode];
        this.reset();
    },

    startSpinning() {
        this.step = this.MAX_STEP - 1;
        this.curentConfig = this.config.STATS[this.mode];
        this.currentSpeed = this.curentConfig.TIME;
        const action3 = cc.sequence(
            cc.delayTime(this.curentConfig.REEL_DELAY_START),
            cc.moveBy(this.currentSpeed, 0, 25),
            cc.moveBy(this.currentSpeed, 0, -25),
            cc.callFunc(() => {
                this.runSpinning();
            }),
        );
        this.reel.runAction(action3);
    },

    runSpinning() {
        this.runSpinningAnimation(() => {
            if (this.step > this.showNumber) {
                this.runSpinning();
                this.step--;
                if (this.step < this.totalNumber) {
                    this.showResult = 1;
                }
            } else if (this.step == this.showNumber) {
                if (this.delayIndex === (this.config.TABLE_FORMAT.length - 1) && this.isNearWin && !this.isFastToResult) {
                    this.runStopAnimation(50, 0.2);
                } else {
                    this.runStopAnimation(this.curentConfig.REEL_EASING_DISTANCE, this.curentConfig.REEL_EASING_TIME);
                }
            }
        });
    },

    stopSpinning(delay = 0, content, callback, isMultiplier = false) {
        this.callbackStopReel = callback ? callback : () => { };
        this.changeOption(content, isMultiplier);
        cc.director.getScheduler().unschedule(this.setStepToStop, this);
        cc.director.getScheduler().schedule(this.setStepToStop, this, 0, 0, this.config.REEL_DELAY_STOP, false);
    },

    changeOption(content, isMultiplier) {
        const { spinAmount, multiplierIndex } = content;
        for (let i = 0; i < this.totalNumber; ++i) {
            if (!isMultiplier) {
                this.symbols[i].getComponent("SymbolOptions8983").changeToSymbol(SPIN_AMOUNT[spinAmount]);
            } else {
                this.symbols[i].getComponent("SymbolOptions8983").changeToSymbol(multiplierIndex - 1);
            }
        }
    },

    runSpinningAnimation(callback) {
        let time = this.currentSpeed + this.currentSpeed * this.stop / 4;
        const action0 = cc.sequence(
            cc.moveBy(time, 0, -1 * this.config.SYMBOL_MYTHICAL_HEIGHT),
            cc.callFunc(this.circularSymbols, this),
            cc.callFunc(callback)
        );
        this.reel.runAction(action0);
    },

    circularSymbols() {
        const lastSymbol = this.reel.children[this.index % (this.totalNumber)];
        if (this.showResult) {
            lastSymbol.getComponent("SymbolOptions8983").changeToBlurSymbol(this.getRandomOptionIndex());
        } else if (this.stop < this.totalNumber) {
            let isRealSymbol = this.stop >= this.config.TABLE_SYMBOL_BUFFER.TOP && this.stop < this.showNumber + this.config.TABLE_SYMBOL_BUFFER.TOP;
            this.step = this.totalNumber + this.showNumber - (this.stop + this.config.TABLE_SYMBOL_BUFFER.BOT);
            if (isRealSymbol) {
                lastSymbol.getComponent("SymbolOptions8983").changeToSymbol(this.stop);
                this.usingMotionBlur && lastSymbol.stopBlur();
                this.showSymbols.unshift(lastSymbol);
            } else {
                lastSymbol.getComponent("SymbolOptions8983").changeToBlurSymbol(this.stop);
            }
            this.stop++;
        }
        lastSymbol.y = lastSymbol.y + this.config.SYMBOL_MYTHICAL_HEIGHT * this.totalNumber;
        this.index++;
    },

    getRandomOptionIndex() {
        return Math.floor(Math.random() * this.optionList.length);
    },

    runStopAnimation(indexNearWin, time) {
        const timer = time ? time : this.curentConfig.TIME;
        this.onReelStop();
        const action3 = cc.sequence(
            cc.moveBy(timer, 0, -indexNearWin),
            cc.moveBy(timer, 0, indexNearWin),
            cc.callFunc(() => {
                this.reset();
                this.displayFreeOptionResult();

                cc.director.getScheduler().unschedule(this.setStepToStop, this);
                this.currentSpeed = this.curentConfig.TIME;
                this.callback && this.callback();

            })
        );
        this.reel.runAction(action3);
    },

    displayFreeOptionResult() {

        this.tweenDisplayResult = cc.tween(this.node)
            .delay(2)
            .call(() => {
                this.callbackStopReel && this.callbackStopReel();
                this.callbackStopReel = null;
                this.tweenDisplayResult = null;
                this.reset();
            });
        this.tweenDisplayResult.start();
    },
});
