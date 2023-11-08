

const Points = [
    'AC', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'MC', 'JC', 'QC', 'KC',
    'AR', '2R', '3R', '4R', '5R', '6R', '7R', '8R', '9R', 'MR', 'JR', 'QR', 'KR',
    'AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'MH', 'JH', 'QH', 'KH',
    'AB', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B', 'MB', 'JB', 'QB', 'KB',
];

cc.Class({
    extends: cc.Component,

    properties: {
        // nodes
        cardBG: cc.Sprite,
        mainPic: cc.Sprite,
        // resources
        cards: {
            default: [],
            type: cc.SpriteFrame
        },
        backBG: {
            default: [],
            type: cc.SpriteFrame
        },
        point: '',
        overlay: cc.Node,
    },

    // use this for initialization
    init (card) {
        const {point, isFaceUp = false, backStyle = 0} = card;
        if (point) {
            this.mainPic.spriteFrame = this.cards[Points.indexOf(point)];
        }
        this.point = point;
        this.isFaceUp = isFaceUp;

        this.cardBG.spriteFrame = this.backBG[backStyle];

        this.handleFaceUp();
    },

    updateCard(card, noAnim) {
        const {point, isFaceUp = false} = card;
        this.point = point;
        if (point) {
            this.mainPic.spriteFrame = this.cards[Points.indexOf(point)];
            if (isFaceUp) {
                this.revealUp(noAnim);
            }
        }else{
            this.mainPic.spriteFrame = this.backBG[0];
        }
    },

    scaleTo(num) {
        this.node.scaleX = num;
        this.node.scaleY = num;
    },

    updatePoint(point) {
        this.point = point;
        this.mainPic.spriteFrame = this.cards[Points.indexOf(point)];
    },

    handleFaceUp() {
        this.mainPic.node.active = this.isFaceUp;
    },

    reveal(noAnim) {
        this.isFaceUp = !this.isFaceUp;
        this.mainPic.node.active = true;

        if (noAnim) {
            this.handleFaceUp();
            return;
        }

        const {height} = this.node.getContentSize();
        const actionBy = cc.scaleTo(0.2, 0, 1);
        const skewBy = cc.skewTo(0.2, height/10, height/10);
        const actionTo = cc.scaleTo(0.2, 1, 1);
        const skewTo = cc.skewTo(0.2, 0, 0);

        this.node.runAction(cc.sequence(
            cc.callFunc(() => {
                this.node.runAction(actionBy);
                this.node.runAction(skewBy);
            }),
            cc.delayTime(0.2),
            cc.callFunc(() => {
                this.handleFaceUp();
            }),
            cc.callFunc(() => {
                this.node.runAction(actionTo);
                this.node.runAction(skewTo);
            })));
    },

    revealUp(noAnim) {
        if (!this.isFaceUp && this.point) {
            this.reveal(noAnim);
        }
    },

    showOverlay(isActive){
        this.overlay.active = isActive;
    }
});
