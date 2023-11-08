cc.Class({
    extends: cc.Component,

    properties: {
        nearWinEffect: cc.Node,
        symbolsHolder: cc.Node,
        symbolPrefab: cc.Prefab,
        bonusSymbol: 'R',
        scatterSymbol: 'A',
        jackpotSymbol: 'JP',
        startAtScatterCount: 2,
        stopAtScatterCount: 5,
        startAtBonusCount: 2,
        stopAtBonusCount: 5,
        startAtJackpotCount: 4,
        isSkipNearWinTurbo: true
    },

    onLoad() {
        this._startX = -(this.node.config.TABLE_FORMAT.length / 2 - 0.5) * this.node.config.SYMBOL_WIDTH;
        this._nearWinSymbols = [];
        this._countScatter = 0;
        this._countBonus = 0;
        this._countJp = 0;
        this._nearWinData = [];
        this._nearWinAnim = null;
        this._getAnimNearWin();
    },
    start() {
        this.node.on("REEL_ABOUT_TO_STOP_NEARWIN", this.setupNearWin, this);
        this.node.on("REEL_STOP_NEARWIN", this.reelStopNearWin, this);
        this.node.on("TABLE_START_NEARWIN", this.resetNearWin, this);
    },

    /**
     * @API
     */
    setupNearWin({ reels, data }) {
        const matrix = this._getMatrix(data);
        this._isSkipEffect = this.isSkipNearWinTurbo && (reels[0].curentConfig.mode === "TURBO");

        for (let col = 0; col < matrix.length; col++) {
            this._setDataNearWin(col);
            const { isNearWin } = this._nearWinData[col];
            reels[col].extendTimeToStop(isNearWin);

            for (let symbolName, row = 0; row < matrix[col].length; row++) {
                symbolName = matrix[col][row];
                if (symbolName === this.bonusSymbol) {
                    this._countBonus++;
                    this._canWinBonus(col) && this._createSymbol(this.bonusSymbol, col, row);
                }
                if (symbolName === this.scatterSymbol) {
                    this._countScatter++;
                    this._canWinFree(col) && this._createSymbol(this.scatterSymbol, col, row);
                }
                if (symbolName === this.jackpotSymbol) {
                    this._countJp++;
                    this._canWinJP(col) && this._createSymbol(this.jackpotSymbol, col, row);
                }
            }
            this._nearWinData[col].canWinBonus = this._canWinBonus(col);
            this._nearWinData[col].canWinFree = this._canWinFree(col);
            this._nearWinData[col].canWinJP = this._canWinJP(col);
        }
        cc.warn('%c nearWinList', 'color: orange', this._nearWinData);
    },
    reelStopNearWin({ count, context }) {
        if (count >= this.node.reels.length) return this.resetNearWin();
        if (context.isFastToResult) return;
        this._playNearWinSymbols(count - 1);
        this._playNearWinEffect(count);
    },
    resetNearWin() {
        this._countScatter = 0;
        this._countBonus = 0;
        this._countJp = 0;
        this._nearWinData.length = 0;
        this._clearSymbols();
        this._stopNearWinEffect();
        this._stopSoundNearWin();
    },


    /** @private */
    _getMatrix(data) {
        return data.slice();
    },


    //* logic play symbol
    _canWinBonus(col) {
        if ((col === 2) && (this._countBonus < 1)) return false;
        if ((col === 3) && (this._countBonus < 2)) return false;
        if ((col === 4) && (this._countBonus < 3)) return false;
        return true;
    },
    _canWinFree(col) {
        if ((col === 2) && (this._countScatter < 1)) return false; // _|_|_|
        if ((col === 3) && (this._countScatter < 2)) return false; // A|_|_|_|
        if ((col === 4) && (this._countScatter < 3)) return false; // A|_|_|_|A
        return true;
    },
    _canWinJP(col) {
        return this._countJp === col + 1;
    },

    _createSymbol(symbolName, col, row) {
        const symbol = this._getNewSymbol();
        symbol.active = true;
        symbol.parent = this.symbolsHolder;
        symbol.x = this._getXPosition(col);
        symbol.y = this._getYPosition(col, row);
        symbol.changeToSymbol(symbolName);
        symbol.disableHighlight();
        symbol.col = col;
        symbol.row = row;
        symbol.symbolName = symbolName;
        symbol.active = false;
        this._nearWinSymbols.push(symbol);
    },
    _getNewSymbol() {
        // override it if using pool
        return cc.instantiate(this.symbolPrefab);
    },
    _getXPosition(col) {
        return this._startX + this.node.config.SYMBOL_WIDTH * col;
    },
    _getYPosition(col, row) {
        const showNumber = this.node.config.TABLE_FORMAT[col];
        return (showNumber / 2 - 0.5 - row) * this.node.config.SYMBOL_HEIGHT;
    },

    _playNearWinSymbols(col) {
        this.symbolsHolder.opacity = 255;
        this._nearWinSymbols.forEach(symbol => {
            if (symbol.col <= col) {
                this._playAnimSymbol(symbol);
                this.node.emit('SHOW_STATIC_SYMBOL', col, symbol.row, symbol.symbolName, false);
            }
        });
    },
    _playAnimSymbol(symbol) {
        symbol.active = true;
        symbol.opacity = 255;
        symbol.enableHighlight();
        symbol.playAnimation();
    },
    _clearSymbols() {
        // override it if using pool
        this._nearWinSymbols.forEach(symbol => {
            this.node.emit('SHOW_STATIC_SYMBOL', symbol.col, symbol.row, symbol.symbolName, true);
            this.symbolsHolder.removeChild(symbol);
            symbol.destroy();
        });
        this._nearWinSymbols.length = 0;
    },


    //* logic play effect
    _getAnimNearWin(){
        if (!this._nearWinAnim) this._nearWinAnim = this.nearWinEffect.getComponentInChildren(cc.Animation);
    },
    _setDataNearWin(col) {
        const isNearWinBonus = this._isNearWinBonus();
        const isNearWinScatter = this._isNearWinScatter();
        const isNearWinJp = this._isNearWinJp();
        const isNearWin = (isNearWinBonus || isNearWinScatter || isNearWinJp);
        this._nearWinData[col] = { isNearWin, isNearWinBonus, isNearWinScatter, isNearWinJp };
    },
    _isNearWinBonus() {
        if (this._isSkipEffect) return false;
        return (this._countBonus >= this.startAtBonusCount) && (this._countBonus < this.stopAtBonusCount);
    },
    _isNearWinScatter() {
        if (this._isSkipEffect) return false;
        return (this._countScatter >= this.startAtScatterCount) && (this._countScatter < this.stopAtScatterCount);
    },
    _isNearWinJp() {
        if (this._isSkipEffect) return false;
        return (this._countJp >= this.startAtJackpotCount);
    },

    _playNearWinEffect(col) {
        const { isNearWin } = this._nearWinData[col];
        if (!isNearWin) return this._stopNearWinEffect();

        if (!this.nearWinEffect.active) {
            this.nearWinEffect.active = true;
            this._nearWinAnim.play();
            this._playSoundNearWin();
        }
        this.nearWinEffect.x = this._getXPosition(col);
    },
    _stopNearWinEffect() {
        if (!this._nearWinAnim) return;
        this._nearWinAnim.stop();
        this.nearWinEffect.active = false;
    },

    _playSoundNearWin() {
        this.node.soundPlayer && this.node.soundPlayer.playSoundNearWin();
    },
    _stopSoundNearWin() {
        this.node.soundPlayer && this.node.soundPlayer.stopSoundNearWin();
    }

});
