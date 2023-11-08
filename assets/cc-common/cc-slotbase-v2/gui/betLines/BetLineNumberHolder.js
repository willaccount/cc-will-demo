cc.Class({
    extends: cc.Component,

    properties: {
        betLineNumberPrefab: cc.Prefab,
        isLeftColumn: true,
        startPosX: 0,
        startPosY: 0,
        spacing: 0,
        textHolderNode: cc.Node,
        betLineNumberText: 'BetLineNumber9976'
    },

    onLoad() {
        this.betLines = [];
        if (this.isLeftColumn) {
            this.betLines = [6,2,8,5,1,4,10,7,3,9];
        } else {
            this.betLines = [16,12,19,14,13,17,18,15,11,20];
        }
        this.selectedBetLines = [];
        this.initBetlineNumbers();

        this.node.on('UPDATE_BET_LINES', this.updateBetLines, this);
    },

    updateBetLines(betLines = []) {
        this.selectedBetLines = [...betLines];
        this._updateBetLineNumbers();
    },

    initBetlineNumbers() {
        for (let i = 0; i < this.betLines.length; i++) {
            let betLineItem = cc.instantiate(this.betLineNumberPrefab);
            betLineItem.active = true;
            const betLineComponent = betLineItem.getComponent(this.betLineNumberText);
            betLineComponent.setActiveBackground(true);
            betLineComponent.setText(this.betLines[i]);
            betLineItem.x = this.startPosX;
            betLineItem.y = this.startPosY - (this.spacing * i);
            betLineItem.parent = this.node;
            //change parent
            let textLabel = betLineItem.getComponentInChildren(cc.Label);
            let textLabelPos = betLineItem.convertToWorldSpaceAR(textLabel.node.position);
            betLineItem.getComponentInChildren(cc.Label).node.parent = this.textHolderNode;
            textLabel.node.setPosition(this.textHolderNode.convertToNodeSpaceAR(textLabelPos));
        }
    },

    _updateBetLineNumbers() {
        for (let i = 0; i < this.betLines.length; i++) {
            const betLineItem = this.node.children[i];
            const betLineComponent = betLineItem.getComponent(this.betLineNumberText);
            let isActive = false;
            if (!this.selectedBetLines.length || this.selectedBetLines.indexOf(this.betLines[i]) !== -1) {
                isActive = true;
            }
            betLineComponent.setActiveBackground(isActive);
        }
    }
});
