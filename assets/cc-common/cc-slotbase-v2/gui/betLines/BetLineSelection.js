const { getKeyWithGame, setKeyWithGame } = require('gameCommonUtils');

cc.Class({
    extends: cc.Component,

    properties: {
        betLineView: cc.Node,
        betLineItemPrefab: cc.Prefab,
        toastView: cc.Node,
        betLineLabel: cc.Label,
        bet: cc.Node,
        panel: cc.Node,
        betLineNumberHolders: {
            type: cc.Node,
            default: []
        },
        maxBetLines: 25,
        betLineComponentText: 'BetLineButton',
        itemWidth: 100,
        itemHeight: 100,
        toggles: [cc.Toggle],
    },

    onLoad() {
        this.mainDirector = this.node.mainDirector.director;
        if (this.betLineLabel) this.betLineLabel.string = this.maxBetLines;
        this.allBetLineTypes = [];
        this.selectBetLineTypes = [];
        this.allBetLineNodes = [];
        this.fullBetLine = [];
        this.oddBetLine = [];
        this.evenBetLine = [];
        this.noneBetLine = [];
        for(let i = 1 ; i<=this.maxBetLines; i++){
            const a = i;
            this.fullBetLine.push(a);
            if(i%2===0){
                const b = i;
                this.evenBetLine.push(b);
            }else{
                const c = i;
                this.oddBetLine.push(c);
            }
        }
        this._renderBetLines();

        this._setDefaultBetLines();
        this.node.on('UPDATE_BET_LINES', this.updateBetLines, this);
        this.node.on('UPDATE_BET_LINES_REAL', this.updateBetLinesReal, this);
        this.node.on('UPDATE_BET_LINES_TRIAL', this.updateBetLinesTrial, this);
        this.node.on('ENABLE_BET_LINE_ITEM', this.enableBetLineItem, this);
        this.node.on('ENABLE_BET_LINE_ITEMS', this.enableBetLineItems, this);
    },

    _setDefaultBetLines() {
        if (this.node.gSlotDataStore) {
            const defaultBetLines = [...Array(this.node.config.PAY_LINE_LENGTH).keys()].map(i => i + 1).join(',');
            const betLines = getKeyWithGame(this.node.config.GAME_ID, this.node.config.BET_LINES_KEY, defaultBetLines);
            if (betLines) {
                this.node.gSlotDataStore.betLines = betLines.split(',').map(e => Number(e)) || [];
                this.allBetLineTypes = this.node.gSlotDataStore.betLines;
                this.updateBetLines(this.node.gSlotDataStore.betLines);
            } else {
                this.node.gSlotDataStore.betLines = [];
                this.updateBetLines([]);
            }
        } else {
            this.allBetLineNodes = [...Array(this.node.config.PAY_LINE_LENGTH).keys()].map(i => i + 1);
        }
    },

    enableBetLineItem(index) {
        this.betLineView.children.forEach((item, i) => {
            const betLineComponent = item.getComponent(this.betLineComponentText);
            betLineComponent.enableButton(index === i);
        });
    },

    enableBetLineItems() {
        this.betLineView.children.forEach((item) => {
            const betLineComponent = item.getComponent(this.betLineComponentText);
            betLineComponent.enableButton(true);
        });
    },

    updateBetLines(betLines = []) {
        if (!this.node.gSlotDataStore.isTrialMode) {
            setKeyWithGame(this.node.config.GAME_ID, this.node.config.BET_LINES_KEY, betLines.join(','));
        }
        this.selectBetLineTypes = [...betLines];
        if (this.betLineLabel) this.betLineLabel.string = betLines.length;
        this.betLineView.children.forEach((item) => {
            const betLineComponent = item.getComponent(this.betLineComponentText);
            const isActive = betLineComponent && betLineComponent.index && betLines.indexOf(betLineComponent.index) !== -1;
            betLineComponent.setActiveButton(isActive);
        });

        this.betLineNumberHolders.forEach(item => {
            item.emit('UPDATE_BET_LINES', betLines);
        });

        this.onBetLineChangedByButton();
    },

    updateBetLinesReal() {
        const defaultBetLines = [...Array(this.node.config.PAY_LINE_LENGTH).keys()].map(i => i + 1).join(',');
        const betLines = getKeyWithGame(this.node.config.GAME_ID, this.node.config.BET_LINES_KEY, defaultBetLines);
        this.updateBetLines(betLines.split(',').map(e => Number(e)) || []);

        const selectedBetLines = this._getSelectedBetLines();
        this._setStoreBetLines(selectedBetLines);
        if (this.betLineLabel) this.betLineLabel.string = selectedBetLines.length;

        const {currentBetData} = this.node.gSlotDataStore.slotBetDataStore.data;
        if (this.bet) this.bet.emit('UPDATE_BET', currentBetData);
        this.betLineNumberHolders.forEach(item => {
            item.emit('UPDATE_BET_LINES', this.node.gSlotDataStore.betLines);
        });
    },

    updateBetLinesTrial(betLines = []) {
        this.selectBetLineTypes = [...betLines];
        if (this.betLineLabel) this.betLineLabel.string = betLines.length;
        this.betLineView.children.forEach((item) => {
            const betLineComponent = item.getComponent(this.betLineComponentText);
            const isActive = betLineComponent && betLineComponent.index && betLines.indexOf(betLineComponent.index) !== -1;
            betLineComponent.setActiveButton(isActive);
        });

        this._setStoreBetLines(this.selectBetLineTypes);
        if (this.betLineLabel) this.betLineLabel.string = this.selectBetLineTypes.length;

        if (this.bet) this.bet.emit('UPDATE_BET', this.node.config.DEFAULT_BET);
        this.betLineNumberHolders.forEach(item => {
            item.emit('UPDATE_BET_LINES', this.node.gSlotDataStore.betLines);
        });

        if (this.toggles) {
            for (let i = 0; i<this.toggles.length; i++) {
                const toggle = this.toggles[i];
                if (toggle &&toggle.isChecked){
                    toggle.uncheck();
                }
            }
        }

    },

    _renderBetLines() {
        const itemPerRow = 5;
        const itemPerCol = this.maxBetLines/itemPerRow;
        this.selectBetLineTypes = [...this.allBetLineTypes];

        for (let i = 1; i <= this.maxBetLines; i++) {
            const betLineItem = cc.instantiate(this.betLineItemPrefab);
            betLineItem.name = 'BetLineButton_' + i;
            const betLineComponent = betLineItem.getComponent(this.betLineComponentText);
            betLineComponent.setActiveButton(true);
            betLineComponent.init(this);
            betLineComponent.setIndex(i);
            betLineComponent.setSound(this.node.soundPlayer);

            betLineItem.x = (Math.floor(i-1)%itemPerRow - itemPerRow/2 + 0.5)*this.itemWidth;
            betLineItem.y = ((Math.floor(i-1)/itemPerRow|0) - itemPerCol/2 + 0.5)*(-this.itemHeight);

            this.allBetLineNodes.push(betLineItem);
            this.betLineView.addChild(betLineItem);
        }
    },

    _setStoreBetLines(selectedBetLines) {
        if (this.node.gSlotDataStore && selectedBetLines) {
            this.node.gSlotDataStore.betLines = [...selectedBetLines];
            if (!this.node.gSlotDataStore.isTrialMode) {
                setKeyWithGame(this.node.config.GAME_ID, this.node.config.BET_LINES_KEY, this.node.gSlotDataStore.betLines.join(','));
            }
        }
    },

    _getSelectedBetLines() {
        let selectedBetLines = [];
        this.betLineView.children.forEach((item) => {
            const betLineComponent = item.getComponent(this.betLineComponentText);
            if (betLineComponent && betLineComponent.index && betLineComponent.isActive) {
                selectedBetLines.push(betLineComponent.index);
            }
        });
        return selectedBetLines.sort((a, b) => a - b);
    },

    compareArr(soureArr, destArr){
        let res = true;
        if(soureArr.length === destArr.length){
            for(let i = 0; i<soureArr.length; i++){
                if(soureArr[i]!=destArr[i]){
                    res = false;
                    break;
                }
            }
        }else{
            res = false;
        }

        return res;
    },

    onBetLineChangedByButton(){
        if(this.toggles){
            for(let i = 0; i<this.toggles.length; i++){
                const toggle = this.toggles[i];
                if(toggle &&toggle.isChecked){
                    toggle.uncheck();
                }
            }
        }else
            return;

        const selectedBetLines = this._getSelectedBetLines();
        if(this.compareArr(selectedBetLines, this.fullBetLine)){
            const allToggle = this.toggles[0];
            if(allToggle){
                allToggle.check();
            }
        }else if(this.compareArr(selectedBetLines, this.evenBetLine)){
            const evenToggle = this.toggles[1];
            if(evenToggle){
                evenToggle.check();
            }
        }else if(this.compareArr(selectedBetLines, this.oddBetLine)){
            const oddToggle = this.toggles[2];
            if(oddToggle){
                oddToggle.check();
            }
        }else if(this.compareArr(selectedBetLines, this.noneBetLine)){
            const nonToggle = this.toggles[3];
            if(nonToggle){
                nonToggle.check();
            }
        }
    },

    /** Select Even BetLines **/
    onSelectEvenPayLines() {
        const evenToggle = this.toggles[1];
        if(evenToggle&&evenToggle.isChecked)
            return;
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
        this.allBetLineNodes.forEach((item, i) => {
            item.emit('SET_ACTIVE', i % 2 !== 0);
        });
        this.mainDirector.onIngameEvent("BET_LINE_EVEN_CLICK");
    },

    /** Select Odd BetLines **/
    onSeletOddBetLines() {
        const oddToggle = this.toggles[2];
        if(oddToggle&&oddToggle.isChecked)
            return;
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
        this.allBetLineNodes.forEach((item, i) => {
            item.emit('SET_ACTIVE', i % 2 === 0);
        });
    },

    /** Cancel Select All BetLines **/
    onCancelSelectBetLines() {
        const nonToggle = this.toggles[3];
        if(nonToggle&&nonToggle.isChecked)
            return;
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
        this.allBetLineNodes.forEach(item => {
            item.emit('SET_ACTIVE', false);
        });
    },

    /** Select All BetLines **/
    onSelectAllBetLines() {
        const allToggle = this.toggles[0];
        if(allToggle&&allToggle.isChecked)
            return;
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
        this.allBetLineNodes.forEach(item => {
            item.emit('SET_ACTIVE', true);
        });
        this.mainDirector.onIngameEvent("BET_LINE_ALL_CLICK");
    },

    /** Check BetLine Before Exit **/
    onCheckBetLines() {
        const selectedBetLines = this._getSelectedBetLines();
        if (!selectedBetLines.length) {
            this.toastView.stopAllActions();
            this.toastView.opacity = 0;
            this.toastView.runAction(
                cc.sequence(
                    cc.fadeIn(0.5).easing(cc.easeSineIn()),
                    cc.delayTime(1),
                    cc.fadeOut(0.5).easing(cc.easeSineIn()),
                )
            );
            return;
        }

        this._setStoreBetLines(selectedBetLines);
        if (this.betLineLabel) this.betLineLabel.string = selectedBetLines.length;

        const {currentBetData} = this.node.gSlotDataStore.slotBetDataStore.data;
        if (this.bet) this.bet.emit('UPDATE_BET', currentBetData);
        this.betLineNumberHolders.forEach(item => {
            item.emit('UPDATE_BET_LINES', this.node.gSlotDataStore.betLines);
        });

        this.hide();
    },

    show() {
        this.panel.active = true;
        this.panel.opacity = 255;
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
        this.mainDirector.onIngameEvent("BET_LINE_OPEN");
        const currentSlotDirector = this.mainDirector.currentGameMode.director;
        if(currentSlotDirector){
            currentSlotDirector.buttons.emit("ENABLE_SPIN_KEY", false);
        }
    },

    hide() {
        this.panel.active = false;
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
        this.mainDirector.onIngameEvent("BET_LINE_CLOSE");
        const currentSlotDirector = this.mainDirector.currentGameMode.director;
        if(currentSlotDirector && this.mainDirector.tutorialMgr && this.mainDirector.tutorialMgr.isFinished()){
            currentSlotDirector.buttons.emit("ENABLE_SPIN_KEY", true);
        }
    }
});
