cc.Class({
    extends: require('SlotReelv2'),

    properties: {
        wildSymbolPrefab: cc.Prefab,
    },

    onLoad() {
        this._super();
        this._symbols = [];
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
        this.subSymbolCount = 0;
        this.isFreeMode = isFreeMode;
        if(isFreeMode){
            this.tempMatrix = [
                [2,1,0,-1],
                [6,5,4,3],
                [10,9,8,7],
                [14,13,12,11],
                [17,16,15,-1]
            ];
        } else {
            this.tempMatrix = [
                [2,1,0],
                [5,4,3],
                [8,7,6],
                [11,10,9],
                [14,13,12]
            ];
        }
        
        const tableFormat = this.isFreeMode ? this.config.TABLE_FORMAT_FREE : this.config.TABLE_FORMAT;
        this.symbolStartY = - (tableFormat[col]/2 + this.config.TABLE_SYMBOL_BUFFER.BOT - 0.5) * this.config.SYMBOL_HEIGHT;
        for (let i = 0; i < this.totalNumber; ++i) {
            const symbol = cc.instantiate(this.symbolPrefab);
            symbol.name = "Symbol_" + i;
            symbol.parent = this.reel;
            symbol.index = i;
            symbol.setPosition(0, this.symbolStartY + i*this.config.SYMBOL_HEIGHT);
            let symbolName = this.getRandomSymbolNameWithException(["s1","s2","A"]);
            if (this.isFreeMode && symbolName[0] == 'K') {
                symbolName = 6;
            }
            symbol.changeToSymbol(symbolName);
            if (i >= this.config.TABLE_SYMBOL_BUFFER.BOT && this.showSymbols.length < this.showNumber) {
                this.showSymbols.unshift(symbol);
            }
            symbol.setSiblingIndex(0);
            this._symbols.push({symbol: symbol, index: i});
        }

        this.mode = 'FAST';
        this.curentConfig = this.config.STATS[this.mode];
        this.index = 0;
        this.reset();

        this.wildType = "";
    },

    initTable(tableParent) {
        this.tableParent = tableParent;
    },

    startSpinningWithDelay(delay) {
        this.removeWildSymbols();
        this._super(delay);
    },

    stopSpinningWithDelay(delay, matrix = [], data = {}, callback, isMissWild) {
        this.isMissWild = isMissWild;
        this.realMatrix = data.matrix[this.col];
        this.multipleValue = data.nwm;
        this.delayIndex = delay;
        this.showSymbols = [];
        this.matrix = matrix;
        this.callbackStopReel = callback ? callback : () => {};
        let reelDelayStop = delay * this.curentConfig.REEL_DELAY_STOP;
        this.isNearWin = false;
        this.delay = delay;
        this.subSymbol1 = data.subSym1;
        this.subSymbol2 = data.subSym2;
        if(data.fSubSym1){
            this.subSymbol1 = data.fSubSym1;
        }
        if(data.fSubSym2){
            this.subSymbol2 = data.fSubSym2;
        }
        this.normalMuitiplier = data.nwm;
        this.freeMuitiplier = data.fwm;
        cc.director.getScheduler().schedule(this.setStepToStop, this, 0, 0, reelDelayStop, false);

        this.matrix.unshift(this.getRandomSymbolNameWithException('A'));
        if (this.config.TABLE_SYMBOL_BUFFER.BOT > 0) {
            this.matrix.push(this.getRandomSymbolNameWithException('A'));
        }

        this.playFishFlying(reelDelayStop, Number.MAX_SAFE_INTEGER);
        // this.startTime = new Date().getTime();
    },

    playFishFlying(reelDelayStop, currentSteps, isFastToResult) {
        const timeStop = this.calculateTimeStop(reelDelayStop, this.stop, currentSteps, isFastToResult);
        const wildIndex = this.realMatrix.indexOf('K');
        this.isWinWild = wildIndex >= 0 && this.multipleValue && this.multipleValue > 1;
        // const isNearWinWild = Math.random() < 0.05 && this.col === 2 && this.isMissWild;
        const isNearWinWild = false;
        const fishFlyingData = { 
            timeStop,
            row: wildIndex, 
            col: this.col, 
            isWinWild: this.isWinWild, 
            isMultiple: this.multipleValue && this.multipleValue > 1, 
            isFakeWild: isNearWinWild,
            multipleValue: this.multipleValue
        };
        if (isFastToResult) {
            // cc.log(timeStop, 'time stop fast calcualte: ' + this.col);
            this.tableParent.speedUpFishFlyingEffect(fishFlyingData);
        } else if (this.tableParent && (this.isWinWild || isNearWinWild) && !this.isFreeMode) {
            // cc.log(timeStop, 'time stop calcualte: ' + this.col);
            this.tableParent.playFishFlyingAnimation(fishFlyingData);
        }
    },

    fastStopSpinning() {
        // check step is reset will not do anything.
        if (this.step === this.MAX_STEP) return;
        this.currentSpeed = this.currentSpeed/3;
        if (!this.isFastToResult) {
            const steps = this.totalNumber + this.showNumber - (this.stop + this.config.TABLE_SYMBOL_BUFFER.BOT);
            this.playFishFlying(0, steps, true);
        }
        this.isFastToResult = true;
        cc.director.getScheduler().unschedule(this.setStepToStop,this);
        this.showResult = 1;
    },

    circularSymbols() {
        // const lastSymbol = this.reel.children[this.index%(this.totalNumber)];
        const symbolIndex = this.index % (this.totalNumber);
        const lastSymbol = this._symbols[symbolIndex].symbol;
        this.index = symbolIndex;
        if (!this.showResult) {
            let nameSymbol = (this.subSymbolCount == 0) ? this.getRandomSymbolName() : this.getRandomSymbolNameWithException(["s1","s2"]);
            if(nameSymbol == 'K') {
                nameSymbol += this.wildType; 
            }
            if (lastSymbol.symbol == "s1" || lastSymbol.symbol == "s2") {
                this.subSymbolCount -= 1;
            }
            if (nameSymbol == "s1" || nameSymbol == "s2") {
                this.subSymbolCount += 1;
            }
            lastSymbol.removeSubSymbol();
            lastSymbol.changeToBlurSymbol(nameSymbol);
        } else if (this.stop < this.totalNumber) {
            let isRealSymbol = this.stop >= this.config.TABLE_SYMBOL_BUFFER.TOP && this.stop < this.showNumber + this.config.TABLE_SYMBOL_BUFFER.TOP;
            let symbolValue = this.matrix[this.stop];

            if(symbolValue == 'K') {
                symbolValue += this.wildType;
            }
            this.stop === 0 ? lastSymbol.changeToBlurSymbol(symbolValue) : lastSymbol.changeToSymbol(symbolValue);
            if (isRealSymbol) {
                this.showSymbols.unshift(lastSymbol);
            }
            //Show Sub Symbol
            
            if (this.subSymbol1 && isRealSymbol && this.subSymbol1.indexOf(this.tempMatrix[this.col][this.stop - 1]) >= 0) {
                lastSymbol.addSubSymbol('s1');
            } else if (this.subSymbol2 && isRealSymbol && this.subSymbol2.indexOf(this.tempMatrix[this.col][this.stop - 1]) >= 0) {
                lastSymbol.addSubSymbol('s2');
            } else {
                lastSymbol.removeSubSymbol();
            } 
            lastSymbol.isRealSymbol = isRealSymbol;
            if (symbolValue[0] === 'K' && isRealSymbol) {
                lastSymbol.isTransformWild = true;
                if (!this.isFreeMode && this.multipleValue && this.multipleValue > 1) {
                    lastSymbol.changeToFakeSymbol(this.getRandomSymbolNameWithException(["s1","s2",'A','K']));
                }
            }
            this.step = this.totalNumber + this.showNumber - (this.stop + this.config.TABLE_SYMBOL_BUFFER.BOT);
            this.stop++;
        }
        lastSymbol.y = lastSymbol.y + this.config.SYMBOL_HEIGHT*(this.totalNumber);
        lastSymbol.setSiblingIndex(0);
        this.index++;
    },

    onReelStop() {
        this.reel.children.forEach((child) => {
            if (!child.isTransformWild) {
                child.changeToSymbol(child.symbol);
            }
        });
        // this.endTime = new Date().getTime();
        // cc.log((this.endTime - this.startTime) / 1000, 'time stop table: ' + this.col);
    },

    reset() {
        this._super();
        this.addWildSymbols();
    },

    addWildSymbols() {
        this.reel.children.forEach((child) => {
            if (child.isTransformWild) {
                const wildSymbol = cc.instantiate(this.wildSymbolPrefab);
                child.wildSymbol = wildSymbol;
                child.addWildSymbol(wildSymbol);
                child.isTransformWild = false;
            }
        });
    },

    removeWildSymbols() {
        this.reel.children.forEach((child) => {
            if (child.wildSymbol) {
                child.removeWildSymbol(child.wildSymbol);
                child.wildSymbol = null;
            }
        });
    },

    setWildType(type) {
        this.wildType = '' + type;
    },

    getRandomSymbolNameWithException(exceptionSymbol) {
        let symbol = this.symbolList[Math.floor(Math.random()*this.symbolList.length)];
        if(symbol == exceptionSymbol || exceptionSymbol.indexOf(symbol) >= 0){
            symbol = this.getRandomSymbolNameWithException(exceptionSymbol);
        }
        return symbol;
    },

    calculateTimeStop(reelDelayStop = 0, currentStop = 0, currentSteps = 0, isFastToResult) {
        let step = currentSteps > 100 ? this.curentConfig.STEP_STOP * 2 - this.showNumber : currentSteps;
        let totalStep = step;
        let stop = currentStop;
        let timer = this.currentSpeed + this.currentSpeed*stop/4;
        let showResult = isFastToResult ? 1 : 0;
        if (isFastToResult) {
            totalStep = step > this.totalNumber ? this.totalNumber : step;
        }
        for (let index = 0; index < totalStep; index++) {
            if (showResult) {
                stop++;
            }
            if (step > this.showNumber) {
                timer += this.currentSpeed + this.currentSpeed*stop/4;
                step--;
                if (step < this.totalNumber) {
                    showResult = 1;
                }
            } else if (step == this.showNumber) {
                timer += this.curentConfig.REEL_EASING_TIME * 2;
            }
        }
        return timer + reelDelayStop;
    },
});