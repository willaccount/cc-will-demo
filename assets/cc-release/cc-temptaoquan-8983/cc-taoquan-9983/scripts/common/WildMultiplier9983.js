const { convertAssetArrayToObject } = require('utils');

const COLOR = ['Bac', 'Do', 'Den', 'XanhDuong', 'Vang', 'XanhLa', 'Tim'];

cc.Class({
    extends: cc.Component,

    properties: {
        display: cc.Node,
        images: [cc.SpriteFrame],
        spine: cc.Node,
    },

    onLoad() {
        this.node.on('ACTIVE_MULTIPLIER', this.active, this);
        this.node.on('ACTIVE_FAST', this.active_fast, this);
        this.node.on('HIDE', this.hide, this);
        this.node.on('HIDE_FAST', this.hideFast, this);
        this.assets = convertAssetArrayToObject(this.images);
        this.display.scale = 0;
        if (this.spine) {
            this.spineAnim = this.spine.getComponent(sp.Skeleton);
        }
    },

    hide() {
        this.display.stopAllActions();
        this.display.opacity = 0;
        this.callback && this.callback();
        this.callback = null;
        if (this.isShowing) {
            this.display.scale = 1;
            this.display.angle = 0;
            this.display.opacity = 255;
            this.display.runAction(cc.fadeOut(0.4));
            this.isShowing = false;
            if (this.spineAnim) this.spineAnim.setAnimation(0, 'Static', true);
        }
    },
    hideFast() {
        this.display.stopAllActions();
        this.display.opacity = 0;
        this.callback && this.callback();
        this.callback = null;
        if (this.isShowing) {
            this.display.scale = 1;
            this.display.angle = 0;
            this.isShowing = false;
        }
    },
    active(multiplier, color = 7, isAutoSpin, callback) {
        this.isShowing = true;
        this.callback = callback;
        if (!isAutoSpin) {
            this.callback && this.callback();
            this.callback = null;
        }

        if (this.spineAnim) {
            this.spineAnim.setAnimation(0, 'Win', false);
            this.spineAnim.addAnimation(0, 'Idle', false);
            this.spineAnim.addAnimation(0, 'Static', true);
        }
        let delayTime = 0;
        const imagesName = this.convertName(multiplier, color);
        this.display.getComponent(cc.Sprite).spriteFrame = this.assets[imagesName];
        this.display.stopAllActions();
        this.display.scale = 0;
        this.display.angle = 0;
        this.display.opacity = 255;
        cc.tween(this.display)
            .to(0.8, { angle: 360, scale: 1.3 })
            .to(0.2, { scale: 1 })
            .delay(delayTime)
            .call(() => {
                if (isAutoSpin) {
                    this.callback && this.callback();
                    this.callback = null;
                }
            })
            .start();
    },

    active_fast(multiplier, color = 7) {
        this.isShowing = true;
        const imagesName = this.convertName(multiplier, color);
        this.display.getComponent(cc.Sprite).spriteFrame = this.assets[imagesName];
        if (this.spineAnim) this.spineAnim.setAnimation(0, 'Static', true);
        this.display.scale = 1;
        this.display.angle = 0;
        this.display.opacity = 255;
    },

    convertName(multiplier, color) {
        return 'X' + multiplier + '-' + COLOR[color - 1];
    }
});
