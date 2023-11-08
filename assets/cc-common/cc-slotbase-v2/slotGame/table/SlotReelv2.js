

const lodash = require('lodash');

cc.Class({
    extends: require('SlotReel'),
    properties: {
        usingMotionBlur: false,
        animSymbol : cc.Prefab
    },
    onLoad() {
        this.node.mainComponent = this;
        this.MAX_STEP = Number.MAX_SAFE_INTEGER;
    },
    init(showNumber, gameConfig, col, symbolPrefab, isFreeMode = false) {
        this.col = col;
        this.config = gameConfig;
        if(isFreeMode) {
            this.symbolList = this.config.SYMBOL_NAME_LIST_FREE[col];
        } else {
            this.symbolList = this.config.SYMBOL_NAME_LIST[col];
        }
        this.symbolPrefab = symbolPrefab;
        this.showNumber = showNumber;
        this.showSymbols = [];
        this.totalNumber = this.showNumber + this.config.TABLE_SYMBOL_BUFFER.TOP + this.config.TABLE_SYMBOL_BUFFER.BOT;
        this.isFreeMode = isFreeMode;
        this.symbolStartY = - (this.config.TABLE_FORMAT[col]/2 + this.config.TABLE_SYMBOL_BUFFER.BOT - 0.5) * this.config.SYMBOL_HEIGHT;
        for (let i = 0; i < this.totalNumber; ++i) {          
            const symbol = cc.instantiate(this.symbolPrefab);
            symbol.name = "Symbol_" + i;
            symbol.parent = this.reel;
            symbol.setPosition(0, this.symbolStartY + i*this.config.SYMBOL_HEIGHT);
            symbol.changeToSymbol(this.getRandomSymbolName());
            if (i >= this.config.TABLE_SYMBOL_BUFFER.BOT && this.showSymbols.length < this.showNumber) {
                this.showSymbols.unshift(symbol);
            }
        }

        this.mode = 'FAST';
        this.curentConfig = this.config.STATS[this.mode];
        this.index = 0;
        this.reset();
    },
    
    initSymbolBetHistory(showNumber, gameConfig, col, symbolPrefab, isFreeMode = false) {
        this.col = col;
        this.config = gameConfig;

        if(isFreeMode) {
            this.symbolList = this.config.SYMBOL_NAME_LIST_FREE[col];
        } else {
            this.symbolList = this.config.SYMBOL_NAME_LIST[col];
        }

        this.symbolPrefab = symbolPrefab;
        this.showNumber = showNumber;
        this.showSymbols = [];
        this.totalNumber = this.showNumber;

        this.symbolStartY = - (this.config.TABLE_FORMAT[col]/2 - 0.5) * this.config.SYMBOL_HEIGHT_HISTORY;
        for (let i = 0; i < this.totalNumber; ++i) {          
            const symbol = cc.instantiate(this.symbolPrefab);
            symbol.name = "Symbol_" + i;
            symbol.parent = this.reel;
            symbol.setPosition(0, this.symbolStartY + i*this.config.SYMBOL_HEIGHT_HISTORY);
            symbol.changeToSymbol(this.getRandomSymbolName());
            if (i >= 0 && this.showSymbols.length < this.showNumber) {
                this.showSymbols.unshift(symbol);
            }
        }

        this.index = 0;
        this.curentConfig = this.config.STATS[this.mode];
        this.reset();
    },

    getRandomSymbolName() {
        return this.symbolList[Math.floor(Math.random()*this.symbolList.length)];
    },

    getRandomSymbol() {
        let listSymbol = lodash.cloneDeep(this.symbolList);
        if (typeof this.config.SUB_SYMBOL !== 'undefined') {
            listSymbol = listSymbol.filter(i => !this.config.SUB_SYMBOL.includes(i));
        }
        if (!listSymbol[Math.floor(Math.random()*listSymbol.length)])
        {
            cc.log("Error");
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
        this.curentConfig = this.config.STATS[this.mode];
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
                if (this.delayIndex === (this.config.TABLE_FORMAT.length - 1) && this.isNearWin && !this.isFastToResult) {
                    this.runStopAnimation(50, 0.2);
                } else {
                    this.runStopAnimation(this.curentConfig.REEL_EASING_DISTANCE, this.curentConfig.REEL_EASING_TIME);
                }
            }
        });
    },
    stopSpinningWithDelay(delay, matrix = [], callback) {
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

        if (this.config.TABLE_SYMBOL_BUFFER.BOT > 0)
            this.matrix.push(this.getRandomSymbolNameWithException('R'));
        // this.matrix.unshift("2");
        // this.matrix.push("3");
    },
    adjustReelSpeed(speed) {
        this.currentSpeed = speed;
    },
    extendTimeToStop(nearWin) {
        //this.isNearWin = true;
        let reelDelayStop = 0;

        if (nearWin)
            reelDelayStop = (this.curentConfig.REEL_DELAY_STOP + this.curentConfig.NEAR_WIN_DELAY_TIME) * (this.delay);
        else
            reelDelayStop = (this.curentConfig.REEL_DELAY_STOP + this.curentConfig.NEAR_WIN_DELAY_TIME) * (this.delay - 1) + this.curentConfig.REEL_DELAY_STOP;
            
        if (nearWin && this.delay === (this.config.TABLE_FORMAT.length - 1)) {
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
        this.onReelStop();
        const action3 = cc.sequence(
            cc.moveBy(timer, 0, -indexNearWin),
            cc.moveBy(timer, 0, indexNearWin),
            cc.callFunc(() => {
                this.reset();
                this.callbackStopReel();
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
            cc.moveBy(time, 0, -1*this.config.SYMBOL_HEIGHT),
            cc.callFunc(this.circularSymbols,this),
            cc.callFunc(callback)
        );
        this.reel.runAction(action0);
    },
    circularSymbols() {
        const lastSymbol = this.reel.children[this.index%(this.totalNumber)];
        if (!this.showResult) {
            lastSymbol.changeToBlurSymbol(this.getRandomSymbolName());
        } else if (this.stop < this.totalNumber) {
            let isRealSymbol = this.stop >= this.config.TABLE_SYMBOL_BUFFER.TOP && this.stop < this.showNumber + this.config.TABLE_SYMBOL_BUFFER.TOP;
            let symbolValue = this.matrix[this.stop];
            this.step = this.totalNumber + this.showNumber - (this.stop + this.config.TABLE_SYMBOL_BUFFER.BOT);
            if (isRealSymbol) {
                lastSymbol.changeToSymbol(symbolValue);
                this.usingMotionBlur && lastSymbol.stopBlur();
                this.showSymbols.unshift(lastSymbol);
            } else {
                lastSymbol.changeToBlurSymbol(symbolValue);
            }
            this.stop++;
        }
        lastSymbol.y = lastSymbol.y + this.config.SYMBOL_HEIGHT*(this.totalNumber);
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

    updateSymbols(listSymbol){
        this.showSymbols.forEach( (it,index) =>{
            const nameSymbol = listSymbol[index];
            it.changeToSymbol(nameSymbol);
            const hasAnim = this.node.config.SYMBOL_HAVE_ANIM.indexOf(nameSymbol) >= 0;
            if (hasAnim) {
                let slotSymbolPaylineIntro = cc.instantiate(this.animSymbol);
                it.addAnimIntro(slotSymbolPaylineIntro);
                slotSymbolPaylineIntro.init(nameSymbol);
                slotSymbolPaylineIntro.emit("PLAY_ANIMATION", true);
            }
        });
    },

    hideAnimIntro(){
        this.showSymbols.forEach(it =>{
            it.hideAnimIntro();
        });
    },

    updateIntroScatterToReal(){
        this.showSymbols.forEach(it =>{
            it.updateIntroScatterToReal();
        });
    },
});