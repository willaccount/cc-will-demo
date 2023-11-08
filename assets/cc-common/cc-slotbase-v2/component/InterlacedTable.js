

const {convertAssetArrayToObject} = require("utils");
const {convertSlotMatrixTBLR,} = require('utils');
const {getPostionInOtherNode} = require('utils');

const STATE = cc.Enum({
    STOPPED: 0,
    SPINNING: 1,
});

const POOL_QUANTITY = 60;

cc.Class({
    extends: cc.Component,

    properties: {
        slotRowPrefab: cc.Prefab,
        slotRowUnmasked: cc.Prefab,
        symbolPrefab: cc.Prefab,
        startSpinDelay: 0.1,
        stopSpinDelay: 0.1,
        startSpeed: 1200,
        acceleration: 600,
        maxSpeed: 1200,
        speedToStop: 600,
        speedToStopWithEffect: 200,
        stopOffset: 30,
        tableSpeed: 2,
        symbolList: [cc.SpriteFrame],
        powerUpSprite: [cc.SpriteFrame],
        powerUpSpinAnim: sp.Skeleton,
        upgradeSprite: [cc.SpriteFrame],
        powerUpSymbol: [cc.String],
        emptySymbolFilter: "10",
    },

    onLoad()
    {
        this.symbolList = convertAssetArrayToObject(this.symbolList);
        this.powerUpSprite = convertAssetArrayToObject(this.powerUpSprite);
        this.upgradeSprite = convertAssetArrayToObject(this.upgradeSprite);
        this.node.on("INIT",this.init,this);
        this.node.on("SET_MODE",this.setMode,this);
        this.node.on("START_SPINNING",this.startSpinning,this);
        this.node.on("STOP_SPINNING",this.stopSpinning,this);
        this.node.on("FAST_TO_RESULT",this.fastToResult,this);
        this.node.on("CHANGE_MATRIX",this.changeMatrix,this);

        this.symbolPool = new cc.NodePool("PoolHandler");
        for (let i=0; i<POOL_QUANTITY; i++)
        {
            this.symbolPool.put(cc.instantiate(this.symbolPrefab));
        }

        this.extendLoad();
    },

    extendLoad()
    {
        this.kyloSymbol = this.symbolList[2];
        this.originalKylo = this.kyloSymbol;
        this.node.mode = 'FAST';
    },

    init()
    {
        
    },

    setMode()
    {
        
    },

    start()
    {
        this.config = {
            "startSpeed": this.startSpeed,
            "acceleration": this.acceleration,
            "maxSpeed": this.maxSpeed,
            "speedToStop": this.speedToStop,
            "symbolList": this.symbolList,
            "stopOffset": this.stopOffset,
            "tableSpeed": this.tableSpeed,
            "powerUpSymbol": this.powerUpSymbol,
            "powerUpSprite": this.powerUpSprite,
            "upgradeSprite": this.upgradeSprite,
            "speedToStopWithEffect": this.speedToStopWithEffect,
            "matrixLevel": 0,
        };

        this.cachedSpeed = this.tableSpeed;

        this.maskRows = [];
        this.unmaskRows = [];
        this.cellList = [];
        this.initTable([8,8,8,8,8]);
        this.state = STATE.STOPPED;
        this.cachedPosition = this.node.position;

        this.node.on("CELL_STOP", ()=>{
            this.onCellStop();
        });

        this.effect = [0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,];

    },

    //table format must be rectangle
    initTable(format)
    {
        this.format = format;
        const width = (this.node.config.SYMBOL_WIDTH + this.node.config.SYMBOL_MARGIN_RIGHT);
        const height = (this.node.config.SYMBOL_HEIGHT); //should replace spaceY
        const startX = -(format.length / 2 - 0.5) * width;

        //init row
        let startRowY = (format[0]/2 - 0.5) * height;
        for (let i=0; i<format[0]; i++)
        {
            let row = cc.instantiate(this.slotRowPrefab);
            row.setParent(this.node);
            row.name = "mask_row_" + i;
            row.setPosition(0, startRowY - i * height, 0);
            row.height = height;
            row.width = width * format.length;

            let unMaskRow = cc.instantiate(this.slotRowUnmasked);
            unMaskRow.setParent(this.node);
            unMaskRow.name = "unmask_row_" + i;
            unMaskRow.setPosition(0, startRowY - i * height, 0);
            unMaskRow.height = height;
            unMaskRow.width = width * format.length;

            this.maskRows[i] = row;
            this.unmaskRows[i] = unMaskRow;
        }

        //create symbol
        for (let i=0; i<format.length; i++)
        {
            // let startY = (format[i]/2 - 0.5) * height;
            for (let j=0; j<format[i]; j++)
            {
                let index = i*format[0] + j;
                let symbol = this.symbolPool.get();
                symbol.setParent(this.maskRows[j]);
                symbol.setPosition(startX + i * width, 0);
                symbol.getComponent("InterlacedSymbol").init(this.config);
                symbol.getComponent("InterlacedSymbol").setParentNode(this.maskRows[j], this.unmaskRows[j]);
                symbol.name = "Symbol_" + (i*format[0] + j);
                this.cellList[index] = symbol.getComponent("InterlacedSymbol");
                this.cellList[index].setIndex(index);
            }
        }
    },

    startSpinning()
    {
        if (this.state == STATE.STOPPED)
        {
            this.effect = [0,0,0,0,0,
                0,0,0,0,0,
                0,0,0,0,0,
                0,0,0,0,0,
                0,0,0,0,0,
                0,0,0,0,0,
                0,0,0,0,0,
                0,0,0,0,0,];

            this.totalCellSpin = 0;
            this.totalCellStop = 0;
            for (let row=0; row<this.maskRows.length; row++)
            {
                for (let col=0; col<this.maskRows[row].children.length; col++)
                {
                    this.totalCellSpin += this.maskRows[row].children[col].getComponent("InterlacedSymbol").startSpin(col*this.startSpinDelay);
                }
            }
            if (this.totalCellSpin > 0)
            {
                this.state = STATE.SPINNING;
            }
        }
        else
        {
            //error here
            cc.error("Table is called spin 2 times");
        }
    },

    stopSpinning(data, callback)
    {
        data = this.filterEmptySymbol(data, this.emptySymbolFilter);
        if (this.state == STATE.STOPPED)
        {
            callback();
        }
        else
        {
            this.onStopSpinCallback = callback;
            this.stopSpinWithEffect(data);
        }
        this.matrix = data;
    },

    fastToResult()
    {
        if (this.state == STATE.SPINNING)
        {
            this.setSpeed(4);
            this.isFastToResult = true;
        }
    },

    setSpeed(speed)
    {
        for (let i=0; i< this.cellList.length; i++)
        {
            this.cellList[i].setSpeed(speed);
        }
    },

    changeMatrix(matrix)
    {
        cc.log("InterlacedTable change matrix " + matrix);
    },

    stopSpinWithEffect(result)
    {
        for (let i=0; i<this.cellList.length; i++)
        {
            let col = Math.floor(i/this.format[0]);
            let row = Math.floor(i%this.format[0]);
            this.cellList[i].stopSpin(result[col][row], col*this.stopSpinDelay, this.effect[i]);
        }
    },

    resetAll()
    {
        this.state = STATE.STOPPED;
        this.node.position = this.cachedPosition;
        this.setSpeed(this.cachedSpeed);
        for (let i=this.cellList.length -1; i>=0; i--)
        {
            this.cellList[i].setKyloSymbol(this.originalKylo);
            this.cellList[i].reset();
            this.symbolPool.put(this.cellList[i].node);
        }
        this.cellList = [];
        this.config.matrixLevel = 0;
        this.node.removeAllChildren(true);
        this.initTable([8,8,8,8,8]);
    },

    expandRow()
    {
        const width = (this.node.config.SYMBOL_WIDTH + this.node.config.SYMBOL_MARGIN_RIGHT);
        const height = (this.node.config.SYMBOL_HEIGHT); //should replace spaceY
        const startX = -(this.format.length / 2 - 0.5) * width;
        const lastRowPosY = this.node.children[this.node.children.length-1].y;

        let index = this.maskRows.length;
        let row = cc.instantiate(this.slotRowPrefab);
        row.setParent(this.node);
        row.name = "mask_row_" + index;
        row.setPosition(0, lastRowPosY - height);
        row.height = height;
        row.width = width * this.format.length;

        let unMaskRow = cc.instantiate(this.slotRowUnmasked);
        unMaskRow.setParent(this.node);
        unMaskRow.name = "unmask_row_" + index;
        unMaskRow.setPosition(0, lastRowPosY - height);
        unMaskRow.height = height;
        unMaskRow.width = width * this.format.length;

        this.maskRows[index] = row;
        this.unmaskRows[index] = unMaskRow;

        for (let j=0; j<this.format.length; j++)
        {
            let symbol = this.symbolPool.get();
            symbol.setParent(this.maskRows[index]);
            symbol.setPosition(startX + j * width, 0);
            symbol.getComponent("InterlacedSymbol").init(this.config);
            symbol.getComponent("InterlacedSymbol").setParentNode(this.maskRows[index], this.unmaskRows[index]);
            symbol.name = "Symbol_" + (index * this.format[0] + j);
            this.cellList.splice((j + 1) * (this.format[0] + 1) - 1, 0, symbol.getComponent("InterlacedSymbol"));
        }
        //reset Index
        for (let i=0; i<this.cellList.length; i++)
        {
            this.cellList[i].setIndex(i);
        }
        this.format = this.format.map(it => it + 1);
    },

    onCellSpin()
    {
        this.totalCellSpin += 1;
    },

    onCellStop()
    {
        this.totalCellStop += 1;
        if (this.totalCellStop == this.totalCellSpin)
        {
            this.onTableFinishSpin();
        }
    },

    onTableFinishSpin()
    {
        this.state = STATE.STOPPED;
        if (this.isFastToResult)
        {
            this.setSpeed(this.cachedSpeed); //reset table speed
            this.isFastToResult = false;
        }
        this.onStopSpinCallback();
    },

    fillLastRow(symbol, delay = 0, callback = null)
    {
        for (let i=0; i<this.format.length; i++)
        {
            let index = (i+1) * this.format[0] - 1;
            let cell = this.cellList[index];
            cell.fillSymbol(symbol, delay * i, ()=>{
                cell.playEffectFillIn();
            });
        }
        this.timeoutFillRow = setTimeout(()=>{
            callback && callback();
        }, delay * this.format.length * 1000);
    },

    fillColumn(column, symbol)
    {
        let startIndex = column * this.format[0];
        for (let i=startIndex; i<startIndex + this.format[0]; i++)
        {
            this.cellList[i].fillSymbol(symbol);
        }
    },

    hideColumn(column)
    {
        let startIndex = column * this.format[0];
        for (let i=startIndex; i<startIndex + this.format[0]; i++)
        {
            this.cellList[i].hide();
        }
    },

    fillMatrix(data, callback)
    {
        data = this.filterEmptySymbol(data, this.emptySymbolFilter);
        for (let i=0; i<this.cellList.length; i++)
        {
            this.cellList[i].fillSymbol(data[i]);
        }
        this.matrix = convertSlotMatrixTBLR(data, this.format);
        callback && callback();
    },

    filterEmptySymbol(matrix, symbol)
    {
        let result = matrix;
        for (let i=0; i<result.length; i++)
            for (let j=0; j<result[i].length; j++)
            {
                if (result[i][j] == symbol)
                {
                    result[i][j] = "0";
                }
            }
        result = result.map(function(it){
            if (it == symbol) return "0";
            return it;
        });
        return result;
    },


    expandAround(index, symbol)
    {
        let position = this.cellList[index].getPosition();
        let col = Math.floor(index / this.format[0]);
        let row = Math.floor(index % this.format[0]);
        let arr = [[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1]];
        //let arr = [-this.format[0]-1, -this.format[0], - this.format[0] + 1, -1, 1, this.format[0] - 1, this.format[0], this.format[0] + 1];
        for (let i=0; i<arr.length; i++)
        {
            let exRow = row + arr[i][0];
            let exCol = col + arr[i][1];
            if (exRow >= 0 && exCol >= 0 && exRow < this.format[0] && exCol < this.format.length)
            {
                const exIndex = exCol * this.format[0] + exRow;
                if (this.cellList[exIndex] && this.cellList[exIndex].getCurrentResult() == 0)
                {
                    this.cellList[exIndex].fillSymbol(symbol, 0);
                    this.cellList[exIndex].playEffectFlyFrom(position);
                }
            }
        }
    },

    spinPowerUp(spinCell)
    {
        this.node.dispatchEvent( new cc.Event.EventCustom('KYLO_PRE_ATTACK', true) );
        this.cellList[spinCell].spinPowerUp();
        this.spinningPowerUp = this.cellList[spinCell];
        let position = getPostionInOtherNode(this.node.parent, this.cellList[spinCell].node);
        this.powerUpSpinAnim.node.active = true;
        this.powerUpSpinAnim.node.setPosition(position);
        this.lastPowerupAnim = "PU" + Math.floor(Math.random()*4 + 1);
        this.powerUpSpinAnim.setAnimation(0, this.lastPowerupAnim);
        this.powerUpSpinAnim.setCompleteListener(this.onPowerUpFinish.bind(this));
        this.node.dispatchEvent( new cc.Event.EventCustom('POWER_UP_SPIN', true) );
        this.powerUpRollCount = 0;
        this.playResultAnim = false;
    },

    stopSpinPowerUp(spinCell, result, matrix, callback = null)
    {
        this.powerUpSpinResult = result;
        this.powerUpStopCb = callback;
        this.powerUpIndexCached = spinCell;
        this.matrix = matrix;
    },

    onPowerUpFinish()
    {
        if (!this.powerUpSpinResult || this.powerUpRollCount <= 6)
        {
            let animName = this.lastPowerupAnim;
            while (animName == this.lastPowerupAnim)
                this.lastPowerupAnim = "PU" + Math.floor(Math.random()*4 + 1);
            this.powerUpSpinAnim.setAnimation(0, this.lastPowerupAnim);
            this.node.dispatchEvent( new cc.Event.EventCustom('POWER_UP_SPIN', true) );
            this.powerUpRollCount += 1;
            this.playAnimBuffer = false;
            this.playAnimResult = false;
        } else if (!this.playAnimBuffer)
        {
            this.spinningPowerUp.node.dispatchEvent( new cc.Event.EventCustom('FINISH_SPIN_POWERUP', true) );
            let animBuffer = this.powerUpSpinResult;
            while (animBuffer == this.powerUpSpinResult || animBuffer == this.lastPowerupAnim)
                animBuffer = "PU" + Math.floor(Math.random()*4 + 1);

            this.powerUpSpinAnim.setAnimation(0, animBuffer);
            this.playAnimBuffer = true;
        } else if (!this.playAnimResult)
        {
            this.powerUpSpinAnim.setAnimation(0, this.powerUpSpinResult);
            this.playAnimResult = true;
        }
        else //ready to get result
        {
            this.node.runAction(cc.sequence(cc.callFunc(()=>{
                this.spinningPowerUp.node.dispatchEvent( new cc.Event.EventCustom('PLAY_POWERUP_EFFECT', true) );
                this.spinningPowerUp.stopSpinPowerUp(this.powerUpSpinResult, ()=>{
                    this.spinningPowerUp = null;
                    this.powerUpSpinResult = null;
                    this.powerUpStopCb && this.powerUpStopCb();
                }); 
            }), cc.callFunc(()=>{
                this.powerUpSpinAnim.node.active = false;
            })));
        }
    },

    //kronos functions
    runPowerUpEffect(data, callback)
    {
        // let effect = null;
        switch (data.powerUpValue)
        {
            case "PU1":
                this.playExpandEffect(callback);
                break;
            case "PU2":
                this.playAddRowEffect(callback);
                break;
            case "PU3":
                this.config.matrixLevel = data.upgradeLevel;
                this.playUpLevelEffect(this.config.matrixLevel, callback);
                break;
            case "PU4":
                this.playBonusEffect(callback);
                break;
        }
    },

    getTableLevel()
    {
        if (this.config)
            return this.config.matrixLevel;
        return 0;
    },

    playExpandEffect(callback = null)
    {
        this.expandAround(this.powerUpIndexCached, "2");

        //TODO: ????
        this.timeoutExpand = setTimeout(()=>{
            callback && callback();}, 800);
    },

    playAddRowEffect(callback = null)
    {
        this.node.dispatchEvent( new cc.Event.EventCustom('TABLE_MOVE_UP', true) );
        this.node.runAction(cc.sequence(cc.moveBy(1, 0, this.node.config.SYMBOL_HEIGHT), cc.callFunc(()=>{
            this.expandRow();
            this.fillLastRow("2", 0.4, callback);
        })));
    },

    playUpLevelEffect(level, callback = null)
    {
        if (level)
        {
            let symbolName = "2" + level;
            this.kyloSymbol = this.upgradeSprite[symbolName];
            for (let i=0; i<this.cellList.length; i++)
            {
                if (this.cellList[i].getCurrentResult() == "2")
                {
                    this.cellList[i].setSprite(this.kyloSymbol);
                }
                else {
                    this.cellList[i].setKyloSymbol(this.kyloSymbol);
                }
                this.cellList[i].applyColorMask(level);
            }
            this.node.emit("APPLY_COLOR_MASK", level);
        }
        callback && callback();
    },

    playBonusEffect(callback = null)
    {
        callback && callback();
    },


    changeFormat(newFormat)
    {
        let rowToAddMore = newFormat[0] - this.format[0];
        for (let i=0; i<rowToAddMore; i++)
        {
            this.expandRow();
            this.node.y += this.node.config.SYMBOL_HEIGHT;
        }
        this.format = newFormat;
    },

    updateWinBonus(data)
    {
        this.cellList[data.position].displayBonus(data);
    },

    mergedSymbol()
    {
        this.node.emit("MERGE_SYMBOL", this.matrix, this.config.matrixLevel);
    },

    hideAllRows()
    {
        this.maskRows.forEach(it => {
            it.active = false;
        });
        this.unmaskRows.forEach(it => {
            it.active = false;
        });
    },

    prepareNearWin(data)
    {
        let newMatrix = this.filterEmptySymbol(data.matrix, this.emptySymbolFilter);
        let foundSymbol = false;
        let nearWinIndex = -1;
        let playNearWin = true;

        for (let i=0; i<this.cellList.length; i++)
        {
            let index = this.cellList.length - i - 1;
            if (this.cellList[index].getCurrentResult() == "0" && !foundSymbol)
            {
                nearWinIndex = index;
                break;
            }
        }

        /*for (let i=0; i<this.matrix.length; i++)
        {
            for (let j=0; j<this.matrix[i].length; j++)
            if ((this.matrix[i][j] != newMatrix[i][j]) && ((i*this.matrix[0].length + j) != nearWinIndex))
            {
                cc.log(this.matrix[i][j], " ", newMatrix[i][j])
                playNearWin = false;
                break;
            }
        }*/
        let col = Math.floor(nearWinIndex / this.format[0]);
        let row = nearWinIndex % this.format[0];

        playNearWin = (!data.lightningGameRemain) || (data.lightningGameRemain == 1 && newMatrix[col][row] != "0");
        if (playNearWin)
        {
            this.effect[nearWinIndex] = 1;
        }
    },

    playAppearEffect()
    {
        for (let i=0; i<this.cellList.length; i++)
        {
            if (this.cellList[i].getCurrentResult() == "2")
            {
                this.cellList[i].playAnimation(true, 1);
            }
        }
    },

    ///test purpose only ------------------------------------------------
    testStopSpin()
    {
        let result = ['2','0','0','0','0',
            '2','0','0','0','0',
            '2','0','0','PU','0',
            '2','2','0','0','0',
            '2','0','2','0','0',
            '2','0','0','2','0',
            '2','0','2','0','0',
            '2','0','0','0','0',];

        let effect = [0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,];
        this.stopSpin(result, effect);
    },

    onDestroy()
    {
        clearTimeout(this.timeoutFillRow);
        clearTimeout(this.timeoutExpand);
    }
});
