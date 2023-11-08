const PoolFactory = require('PoolFactory');
cc.Class({
    extends: cc.Component,

    properties: {
        poolFactory: {
            type: PoolFactory,
            default: null,
            visible: false,
        },
        scrollView: cc.Node,
        content: cc.Node,
        view: cc.Node,
        betSelectPrefabName: ''
    },

    onLoad() {
        this.scrollView.on('scroll-ended', this.scrollEnded, this);
        this.scrollView.on('touch-up', this.touchUp, this);
        this.scrollView.on('scrolling', this.scrollingView, this);

        this.initPos = this.view.height / 2;
        this.heightItem = 60;
        this.node.on('UPDATE_DATA', this.updateData, this);
        this.node.on('SELECT_MAX_BET', this.selectMaxBet, this);
        this.node.on('CLEAR_ALL_BET', this.clearAllBets, this);

        this.view.on(cc.Node.EventType.TOUCH_END, this.touchViewEnded.bind(this));
        this.view.on(cc.Node.EventType.TOUCH_START, this.touchViewStart.bind(this));
        this.view.on(cc.Node.EventType.TOUCH_MOVE, this.touchViewMove.bind(this));
        this.view.on(cc.Node.EventType.TOUCH_CANCEL, this.touchViewCancel.bind(this));

        this.view.on(cc.Node.EventType.MOUSE_WHEEL, this.mouseWheel.bind(this));
        

        this.listItems = [];
        this.currentIndex = 0;
        if (this.node.mainDirector) {
            this.poolFactory = this.node.mainDirector.getComponent(PoolFactory);
        }
    },

    scrollingView() {
        if (this.content.y <= this.limitBottom || this.content.y >= this.limitTop) return;
        if (this.touchViewStart) this.content.y = this.getCorrectPositionY(this.content.y);
    },

    touchViewMove() {
        if (this.touchViewStart) this.content.y = this.getCorrectPositionY(this.content.y);
        if (this.isTouchStarted && !this.isDelayChangeColorButton) {
            this.controller.setSelectColorButtons();
        }
    },

    touchViewEnded() {
        this.isTouchStarted = false;
        if (this.getIsScrolling() === false) this.controller.unSetSelectColorButtons(this.currentIndex == 0);
    },

    touchViewStart() {
        this.isTouchStarted = true;
        this.isDelayChangeColorButton = true;
        this.delayTimeChangeColorButton = 0.15;
    },

    touchViewCancel() {
        if (this.getIsScrolling() === false) this.controller.unSetSelectColorButtons(this.currentIndex == 0);
        this.isTouchUp = false;
        this.calculateScroll();
    },

    getIsScrolling() {
        return this.scrollView.getComponent(cc.ScrollView).isScrolling();
    },

    getSelectBlocked() {
        return this.isSelectBlocked;
    },

    update(dt) {
        if (this.isDelayChangeColorButton) {
            this.delayTimeChangeColorButton -= dt;
            if (this.delayTimeChangeColorButton < 0) {
                this.isDelayChangeColorButton = false;
            }
        }
    },

    mouseWheel() {
        if (parseInt(this.content.y) >= parseInt(this.limitTop)) this.content.y = this.limitTop ;
        if (parseInt(this.content.y) <= parseInt(this.limitBottom)) this.content.y = this.limitBottom ;
        if (this.content.y <= this.limitBottom || this.content.y >= this.limitTop) return;
        if (!this.countWheel) this.countWheel = 0;
        if (!this.content.prevPos) this.content.prevPos = this.content.getPosition();
        if (this.countWheel >= 3) {
            this.scrollDirection = this.content.y - this.content.prevPos.y > 0 ? 1 : -1;
            this.content.y = this.getCorrectPositionY(this.content.y + this.scrollDirection * 25);
            this.countWheel = 0;
        }
        // cc.warn('mouseWheel this.content.y ' + this.content.y + ' this.limitTop ' + this.limitTop + ' this.limitBottom ' + this.limitBottom)
        this.isTouchUp = false;
        this.node.tween && this.node.tween.stop();
        this.node.tween = cc.tween(this.node)
            .delay(0.101)
            .call(() => {
                this.calculateScroll();
            })
            .start();
        this.content.prevPos = this.content.getPosition();
        this.countWheel++;
    },

    clearAllBets() {
        for (let i = 0; i < this.listItems.length; i++) {
            let removedObj = this.listItems[i];
            if (this.poolFactory) this.poolFactory.removeObject(removedObj);
        }
        this.listItems = [];
    },

    updateData(listBetValues = [], currentBetData, controller) {
        this.controller = controller;
        this.clearAllBets();
        this.listBetValues = [...listBetValues];
        this.maxBet = this.listBetValues[0];

        for (let i = 0; i < listBetValues.length; i++) {
            const item = this.poolFactory && this.poolFactory.getObject(this.betSelectPrefabName);
            if (item) {
                item.active = true;
                item.parent = this.content;
                item.emit('UPDATE_DATA', this.listBetValues[i], i, this);
                item.setSiblingIndex(2);
                this.heightItem = item.height;
                this.listItems.push(item);
            }
        }
        const found = this.listBetValues.findIndex(it => { if (it === currentBetData) return true; });
        const reserveFound = this.listBetValues.length - 1 - found;
        this.content.getComponent(cc.Layout).updateLayout();
        this.currentIndex = found;
        this.selectItemInAction(0.1, reserveFound, this.currentIndex == 0);
        this.limitBottom = this.heightItem * 3 ;
        this.limitTop = this.content.height - this.heightItem * 3 ;
    },

    getCorrectPositionY(newY) {
        if (this.content.y <= this.limitBottom) return this.limitBottom;
        else if (this.content.y >= this.limitTop) return this.limitTop;
        return newY;
    },

    setStopTouchUp() {
        this.isTouchUp = false;
    },

    touchUp() {
        this.isTouchUp = true;
    },

    selectBet(index = 0, timeScroll = 0.1) {
        this.controller.setSelectedBet(this.listBetValues[index], index === 0);
        const reserveIndex = this.listBetValues.length - 1 - index;
        this.currentIndex = index;
        this.selectItemInAction(timeScroll, reserveIndex, true);
        this.controller.unSetSelectColorButtons(this.currentIndex == 0);
    },

    selectMaxBet() {
        this.selectBet(0);
    },

    selectItemInAction(time = 0.15, index, isMaxBet = false) {
        if (this.isSelectBlocked) return;
        this.isSelectBlocked = true;
        this.controller.unSetSelectColorButtons(isMaxBet);
        const nextPos = this.initPos + index * this.heightItem;
        this.content.tweenMove && this.content.tweenMove.stop();
        this.content.tweenMove = cc.tween(this.content)
            .to(time, { position: cc.v2(0, nextPos) }, { easing: "expoOut" })
            .start();
        this.content.tweenUnBlock && this.content.tweenUnBlock.stop();
        this.content.tweenUnBlock = cc.tween(this.content)
            .delay(0.1)
            .call(()=>{
                this.isSelectBlocked = false;
            })
            .start();
    },

    scrollEnded() {
        if (this.isTouchUp) {
            this.calculateScroll(0.15);
        }
    },

    calculateScroll(timeScroll = 0.1) {
        const offset = this.content.y - this.initPos;
        let index = Math.round(offset / this.heightItem);
        if (index < 0) index = 0;
        else if (index >= this.listBetValues.length) index = this.listBetValues.length - 1;
        
        const reserveIndex = this.listBetValues.length - 1 - index;
        this.currentIndex = reserveIndex;
        const isMaxBet = reserveIndex == 0;
        this.controller.setSelectedBet(this.listBetValues[reserveIndex], isMaxBet);
        this.selectItemInAction(timeScroll, index, isMaxBet);
        this.isTouchUp = false;
        this.controller.unSetSelectColorButtons(this.currentIndex == 0);
    },

    onDestroy() {
        this.content.tweenUnBlock && this.content.tweenUnBlock.stop();
        this.content.tweenMove && this.content.tweenMove.stop();
        this.node.tween && this.node.tween.stop();
    }
});
