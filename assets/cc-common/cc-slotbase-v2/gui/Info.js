
const { changeParent } = require("utils");

cc.Class({
    extends: cc.Component,

    properties: {
        nextBtn: cc.Node,
        preBtn: cc.Node,
        infoTitle: cc.Node,
        titles: {
            default: [],
            type: cc.SpriteFrame,
        },
        pageViewNode: cc.Node,
        infoPanel: cc.Node,
        infoPanelIndex: 5
    },
    onLoad() {
        this.node.on("NEXT_GAME_INFO", this.next, this);
        this.node.on("PREVIOUS_GAME_INFO", this.previous, this);
        this.curInfoID = 0;
        this.pageView = this.pageViewNode.getComponent(cc.PageView);
        this.pageView.node.on('page-turning', this.pageViewEvent, this);
        this.activeButtons(this.curInfoID);
       
    },

    start() {
        this.setParentInfoPanel();
    },

    setParentInfoPanel() {
        if (this.infoPanel && this.infoPanelIndex) {
            let { cutscene } = this.node.mainDirector.director;
            if (cutscene) {
                changeParent(this.infoPanel, cutscene);
                this.scheduleOnce(()=> {
                    this.infoPanel.setSiblingIndex(this.infoPanelIndex);
                },0.034);
                
            }
        }
    },

    pageViewEvent() {
        let newIndex = this.pageView.getCurrentPageIndex();
        if (Math.abs(newIndex - this.curInfoID) !== 1) {
            this.pageView.scrollToPage(this.curInfoID, 0.1);
            return;
        }
        this.curInfoID = newIndex;
        this.activeButtons(this.curInfoID);
    },

    next() {
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
        this.pageView.scrollToPage(this.curInfoID + 1);
        this.curInfoID++;
        this.activeButtons(this.curInfoID);
    },
    previous() {
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
        this.pageView.scrollToPage(this.curInfoID - 1);
        this.curInfoID--;
        this.activeButtons(this.curInfoID);
    },
    activeButtons(id) {
        const { nextBtn, preBtn, infoTitle } = this;

        const totalInfo = this.pageView.node.getChildByName('view').getChildByName('content').children.length;
        if (id >= totalInfo - 1) {
            id = totalInfo - 1;
            nextBtn.getComponent(cc.Button).interactable = false;
        } else {
            nextBtn.getComponent(cc.Button).interactable = true;
        }

        if (id <= 0) {
            id = 0;
            preBtn.getComponent(cc.Button).interactable = false;
        } else {
            preBtn.getComponent(cc.Button).interactable = true;
        }
        this.curInfoID = id;
        if (infoTitle) {
            if (infoTitle.getComponent(cc.Sprite)) {
                infoTitle.getComponent(cc.Sprite).spriteFrame = this.titles[this.curInfoID];
            } else if (infoTitle.getComponent(cc.Label)) {
                const textData = infoTitle.getComponent('InfoText').textData;
                infoTitle.getComponent(cc.Label).string = textData[this.curInfoID];
            }
        }
    },
    resetInfo() {
        this.pageView.scrollToPage(0, 0);
        this.curInfoID = 0;
        this.activeButtons(this.curInfoID);
    }
});
