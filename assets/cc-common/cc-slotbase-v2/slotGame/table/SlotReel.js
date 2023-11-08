

const lodash = require('lodash');

cc.Class({
    extends: cc.Component,
    properties: {
        reel: cc.Node,
    },
    onLoad() {
        this.node.mainComponent = this;
        this.MAX_STEP = Number.MAX_SAFE_INTEGER;
    },
    init(showNumber, gameConfig, col, symbolPrefab) {
        this.col = col;
        this.CONFIG = gameConfig;
        this.symbolList = this.CONFIG.SYMBOL_NAME_LIST[col];
        this.symbolPrefab = symbolPrefab;
        this.showNumber = showNumber;
        this.showSymbols = [];
        this.bufferSpace = 1;
        this.totalNumber = this.showNumber+2;
        if (this.node.hasBigWild) {
            //If there is big wild, there must be enough space for them to roll
            this.bufferSpace = this.showNumber;
            this.totalNumber += this.showNumber - 1;
        }

        for (let i = 0; i < this.totalNumber; ++i) {          
            const symbol = cc.instantiate(this.symbolPrefab);
            symbol.name = "Symbol_" + i;
            symbol.parent = this.reel;
            symbol.x = this.CONFIG.SYMBOL_WIDTH/2;
            symbol.y = i*this.CONFIG.SYMBOL_HEIGHT + this.CONFIG.SYMBOL_HEIGHT/2;
            symbol.changeToSymbol(this.getRandomSymbolName());
            if (i >= this.bufferSpace && this.showSymbols.length < this.showNumber) {
                this.showSymbols.unshift(symbol);
            }
        }

        this.node.width = this.CONFIG.SYMBOL_WIDTH;
        this.node.height = this.CONFIG.SYMBOL_HEIGHT*(this.showNumber+2);

        this.mode = 'FAST';
        this.curentConfig = this.CONFIG.STATS[this.mode];
        this.index = 0;
        this.reset();

        this.node.y = -1*this.CONFIG.SYMBOL_HEIGHT*(this.bufferSpace);
    },   
    getRandomSymbolName() {
        return this.symbolList[Math.floor(Math.random()*this.symbolList.length)];
    },

    getRandomSymbol() {
        let listSymbol = lodash.cloneDeep(this.symbolList);
        if (typeof this.CONFIG.SUB_SYMBOL !== 'undefined') {
            listSymbol = listSymbol.filter(i => !this.CONFIG.SUB_SYMBOL.includes(i));
        }
        return listSymbol[Math.floor(Math.random()*listSymbol.length)];
    },
    stopReelRoll() {
        this.reel.stopAllActions();
    },
    reset() {
        this.reel.children.forEach((child) => {
            child.y += this.reel.y;
        });
        this.reel.y = 0;
        this.index = this.index%(this.totalNumber);
        this.stop = 0;
        this.step = this.MAX_STEP;
        this.showResult = 0;
        this.matrix = [];
    },
    setMode(mode) {
        this.mode = mode;
    },
    startSpinningWithDelay(delay) {
        this.step = this.MAX_STEP - 1;
        this.isFastToResult = false;
        this.curentConfig = this.CONFIG.STATS[this.mode];
        this.currentSpeed = this.curentConfig.TIME;
        const action3 = cc.sequence(
            cc.delayTime(delay*this.curentConfig.REEL_DELAY_START),
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
                // check last reel, near win and not fast to result
                if (this.delayIndex === (this.CONFIG.TABLE_FORMAT.length - 1) && this.isNearWin && !this.isFastToResult) {
                    this.runStopAnimation(50, 0.2);
                } else {
                    this.runStopAnimation(this.curentConfig.REEL_EASING_DISTANCE, this.curentConfig.REEL_EASING_TIME);
                }
            }
        });
    },
    stopSpinningWithDelay(delay, matrix = [], callback) {
        this.curentConfig = this.CONFIG.STATS[this.mode];
        this.delayIndex = delay;
        this.showSymbols = [];
        this.matrix = matrix;
        this.callbackStopReel = callback ? callback : () => {};
        let reelDelayStop = delay * this.curentConfig.REEL_DELAY_STOP;
        this.isNearWin = false;

        this.delay = delay;
        cc.director.getScheduler().schedule(this.setStepToStop, this, 0, 0, reelDelayStop, false);

        //Add 2 more symbol to apply near miss
        this.matrix.unshift(this.getRandomSymbolNameWithException('A'));
        this.matrix.push(this.getRandomSymbolNameWithException('A'));
        // this.matrix.unshift("2");
        // this.matrix.push("3");
    },
    adjustReelSpeed(speed) {
        this.currentSpeed = speed;
    },
    extendTimeToStop(extra = 0) {
        this.isNearWin = true;
        let reelDelayStop = (this.curentConfig.REEL_DELAY_STOP + this.curentConfig.NEAR_WIN_DELAY_TIME) * (this.delay + extra);
        if (this.delay === (this.CONFIG.TABLE_FORMAT.length - 1)) {
            reelDelayStop = reelDelayStop + this.curentConfig.NEAR_WIN_DELAY_TIME_LAST_REEL;
        }
        cc.director.getScheduler().unschedule(this.setStepToStop,this);
        cc.director.getScheduler().schedule(this.setStepToStop, this, 0, 0, reelDelayStop, false);
    },
    setStepToStop() {
        this.step = this.curentConfig.STEP_STOP*2 - this.totalNumber;
    },
    fastStopSpinning() {
        // check step is reset will not do anything.
        if (this.step === this.MAX_STEP) return;
        this.isFastToResult = true;
        cc.director.getScheduler().unschedule(this.setStepToStop,this);
        this.showResult = 1;
        this.currentSpeed = this.currentSpeed/3;
    },
    runStopAnimation(indexNearWin, time) {
        const timer = time ? time : this.curentConfig.TIME;
        indexNearWin = this.CONFIG.IS_CUSTOM_EASING ? -indexNearWin : indexNearWin;
        this.onReelStop();
        const action3 = cc.sequence(
            cc.callFunc(() => {
                this.callbackStopReel();
            }),
            cc.moveBy(timer, 0, -indexNearWin),
            cc.moveBy(timer, 0, indexNearWin),
            cc.callFunc(() => {
                this.reset();
                /// stop schedule when reel is stopped
                cc.director.getScheduler().unschedule(this.setStepToStop,this);
                this.currentSpeed = this.curentConfig.TIME;  
            })
        );
        this.reel.runAction(action3);
    },
    onReelStop() {
        this.reel.children.forEach((child) => {
            child.changeToSymbol(child.symbol);
        });
    },
    runSpinningAnimation(callback) {
        let time = this.currentSpeed + this.currentSpeed*this.stop/4;
        const action0 = cc.sequence(
            cc.moveBy(time, 0, -1*this.CONFIG.SYMBOL_HEIGHT),
            cc.callFunc(this.circularSymbols,this),
            cc.callFunc(callback)
        );
        this.reel.runAction(action0);
    },
    circularSymbols() {
        const lastSymbol = this.reel.children[this.index%(this.totalNumber)];
        if (!this.showResult) {
            lastSymbol.changeToBlurSymbol(this.getRandomSymbolName());
        } else if (this.stop < this.showNumber+2) { // buffer = 2
            let symbolValue = this.matrix[this.stop];
            if (this.node.transformSymbol && typeof this.node.transformSymbol == "function") {
                //Apply special wild in specific col, or near miss or big wild,.. etcs
                symbolValue = this.node.transformSymbol(symbolValue, this.col, this.stop);
            }
            /**@todo check this condition if buffer !== 2 */
            if(this.stop === 0){
                lastSymbol.changeToBlurSymbol(symbolValue);
            }else{
                lastSymbol.changeToSymbol(symbolValue);
            }
            this.showSymbols.unshift(lastSymbol);
            this.step = this.totalNumber - this.stop + (this.showNumber - this.bufferSpace);
            this.stop++;
        }
        lastSymbol.y = lastSymbol.y + this.CONFIG.SYMBOL_HEIGHT*(this.totalNumber);  
        this.index++;
    },

    getShowSymbol(index)
    {
        return this.showSymbols[index];
    },

    getRandomSymbolNameWithException(exceptionSymbol) {
        let symbol = this.symbolList[Math.floor(Math.random()*this.symbolList.length)];
        if(symbol == exceptionSymbol){
            symbol = this.getRandomSymbolNameWithException(exceptionSymbol);
        }

        return symbol;
    },

    getRandomSymbolNameWithExceptions(exceptionSymbols) {
        const remainSymbols = [];
        const defaultSymbol = '3';
        if (!this.symbolList) return defaultSymbol; //case haven't init;
        for(let i = 0; i<this.symbolList.length; i++){
            const symbol = this.symbolList[i];
            let res = true;
            for(let j = 0; j<exceptionSymbols.length; j++){
                const exception = exceptionSymbols[j];
                if(symbol==exception){
                    res = false;
                    break;
                }
            }
            if(res){
                remainSymbols.push(symbol);
            }
        }
        let symbol = remainSymbols[Math.floor(Math.random()*remainSymbols.length)];
        return symbol;
    },
});