

cc.Class({
    extends: cc.Component,

    properties: {
        colNumber: 5,
        rowNumber: 3,
        WIDTH_STEP: 250,
        HEIGHT_STEP: 250,
        itemPrefab: cc.Node
    },

    onLoad() {
        this.node.on("INIT_TABLE", this.initItems, this);
        this.node.on("OPEN_PICKED_ITEM", this.openPickedItem, this);
        this.node.on("OPEN_ALL_ITEMS", this.openAllItems, this);
        this.node.on("RESUME_MINI_GAME", this.resumeTable, this);
        this.node.on("RESET_MINI_TABLE", this.resetTable, this);
        this.node.on("AUTO_OPEN_BOX", this.autoClick, this);
    },

    randRange(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },

    start() {
        this.startX = -this.colNumber / 2 * this.WIDTH_STEP + this.WIDTH_STEP / 2;
        this.startY = this.rowNumber / 2 * this.HEIGHT_STEP - this.HEIGHT_STEP / 2;
    },

    initItems() {
        this.MAX_BOXES = this.colNumber * this.rowNumber;
        this.listItem = [];
        for (let i = 0; i < this.MAX_BOXES; i++) {
            let item = cc.instantiate(this.itemPrefab);
            this.node.addChild(item);
            item.active = true;
            item.itemId = i;
            this.listItem.push(item);
            item.setPosition(this.getPosByIndex(i));
            // DebugItemId:{
            //     let textNode = new cc.Node();
            //     item.addChild(textNode)
            //     textNode.addComponent(cc.Label).string = item.itemId;
            // }
        }
        this.setPositionItems();
    },
    setPositionItems()
    {
        //customize items positions
    },
    resumeTable(data, defaultValue) {
        for (let i = 0; i < data.length; i++) {
            if (data[i] !== defaultValue) {
                this.listItem[i].itemController.playAnimOpen(data[i]);
            }
        }
    },
    resetTable() {
        for (let i = 0; i < this.listItem.length; i++) {
            this.listItem[i].itemController.resetItem();
        }
    },

    autoClick() {
        const index = this.randRange(0, this.listItem.length);
        this.listItem[index].isOpen ? this.autoClick() : this.listItem[index].itemController.onClickItem(null, true);
    },

    openPickedItem(data, callback) {
        const {index, value} = data;
        this.listItem[index].itemController.playAnimOpen(value, callback);
    },

    openAllItems(result, callback) {
        this.result = result;
        this.updateCurrentMatrix();
        for (let i = 0; i < this.listItem.length; i++) {
            if (this.listItem[i].isOpen === false) {
                let randValue = this.getRandomValue();
                this.listItem[i].itemController.playAnimOpen(randValue);
                cc.tween(this.listItem[i])
                    .to(0.5, {opacity: 100})
                    .start();
            }
        }
        if (callback && typeof callback === 'function') {
            cc.tween(this.node)
                .delay(1)
                .call(() => {
                    callback();
                })
                .start();
        }
    },

    updateCurrentMatrix() {
        const {TREASURE_VALUE} = this.node.config;
        this.listScore = TREASURE_VALUE.map(item => {
            return {value: item.value, count: item.count, currentCount: 0};
        });
        for (let index = 0; index < this.listItem.length; index++) {
            if (this.listItem[index].isOpen) {
                let item = this.listScore.find(item => item.value === this.result[index]);
                if (item) {
                    item.currentCount++;
                } else {
                    cc.log(`Cant find item with result value ${this.result[index]}`);
                }
            }
        }
    },

    getRandomValue() {
        const index = this.randRange(0, this.listScore.length);
        const {currentCount , count} = this.listScore[index];
        if (currentCount < count) {
            this.listScore[index].currentCount++;
            return this.listScore[index].value;
        } else {
            return this.getRandomValue();
        }
    },

    getPosByIndex(index) {
        let x = this.startX + this.WIDTH_STEP * Math.floor(index / this.rowNumber);
        let y = this.startY - this.HEIGHT_STEP * (index % this.rowNumber);
        return cc.v2(x, y);
    },

});
