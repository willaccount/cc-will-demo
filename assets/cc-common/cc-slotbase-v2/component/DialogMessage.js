/**
 * @custom for Message Dialog
 * @for changing button spriteFrames
 */
const { ButtonAsset } = require("CustomDataType");
cc.Class({
    extends: require('ActorDialogSlotbase'),

    properties: {
        buttonAssets: {
            default: [],
            type: ButtonAsset
        },
    },
    show() {
        this._super();
        this._customButtonsForDemo();
    },
    _customButtonsForDemo() {
        const { strText } = this.content;
        if (!this.node.config) {
            cc.error("Need Config");
            return;
        }
        const { FINISH_DEMO, SUGGEST_TURBO } = this.node.config.MESSAGE_DIALOG;
        if (strText === FINISH_DEMO) {
            this._setSpriteButton(this.btnOK, "CHOI_THAT");
            this._setSpriteButton(this.btnCancel, "KHONG");
        } else if (strText === SUGGEST_TURBO) {
            this._setSpriteButton(this.btnOK, "QUAY_NHANH");
            this._setSpriteButton(this.btnCancel, "DE_SAU");
        } else {
            this._setSpriteButton(this.btnOK, "XAC_NHAN");
            this._setSpriteButton(this.btnCancel, "HUY");
        }
        this.node.opacity = 0;
        this.scheduleOnce(() => { this.node.opacity = 255; }, 0);
    },
    _setSpriteButton(button, btnName) {
        const btnAsset = this.buttonAssets.find(btnAsset => btnAsset.name === btnName);
        if (btnAsset) {
            button.normalSprite = btnAsset.normalSprite;
            button.pressedSprite = btnAsset.pressedSprite;
            button.hoverSprite = btnAsset.hoverSprite;
            button.disabledSprite = btnAsset.disabledSprite;
        } else {
            cc.error("Can not find button assets for: ", btnName);
        }
    }

});