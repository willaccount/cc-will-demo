
const cutsceneMode = require('CutsceneMode');
const skinMapping = ["chep_bac", "chep_do", "chep_den", "chep_xanhduong", "chep_vang", "chep_xanhla", "chep_tim"];
const flySkinMapping = ["Ca_Bac", "Ca_Do", "Ca_Den", "Ca_XanhDuong", "Ca_Vang", "Ca_XanhLa", "Ca_Tim"];

const OPTION = [1, 2, 3, 7, 4, 5, 6];


cc.Class({
    extends: cutsceneMode,
    properties: {
        optionList: [cc.Node],
        koiAnim: sp.Skeleton,
        particleKoi: cc.ParticleSystem,
        godKitchen: cc.Node,
        godKitchenNoKoi: cc.Node,
        optionPrefab: cc.Prefab,
        optionHolder: cc.Node,
        spinNumberSprites: {
            default: [],
            type: cc.SpriteFrame
        },
        wildMultiplySprites: {
            default: [],
            type: cc.SpriteFrame
        },
        backgroundSprites: {
            default: [],
            type: cc.SpriteFrame
        },
        scrollSprites: {
            default: [],
            type: cc.SpriteFrame
        },
        frameDecor: cc.Node,
        godKitchenFly: require("Bezier3D"),
    },

    onLoad() {
        this.node.on("PLAY", this.play, this);
        this.node.on("HIDE", this.exit, this);
        this.node.opacity = 0;
        this.node.active = false;
        this.listOptions = [];
    },

    start() {
        this.createOptions();
        this.koiPositionCache = this.godKitchen.position;
    },

    createOptions() {
        if (!this.listOptions || !this.listOptions.length) {
            for (let i = 0; i < this.scrollSprites.length; i++) {
                const option = cc.instantiate(this.optionPrefab);
                this.optionHolder.addChild(option);
                const scriptItem = option.getComponent('OptionController9983');
                if (scriptItem) {
                    scriptItem.updateData({
                        spinNumber: this.spinNumberSprites[i],
                        index: OPTION[i],
                        wildMultiply: this.wildMultiplySprites[i],
                        background: this.backgroundSprites[i],
                        scroll: this.scrollSprites[i],
                        spinImageList: this.spinNumberSprites,
                        wildMultiplyImageList: this.wildMultiplySprites,
                    });
                    scriptItem.attachEvent(OPTION[i], this.selectOption.bind(this));
                    this.listOptions.push(option);
                }
            }
        }
    },

    resetCutscene() {
        this.isReady = false;
        this.clicked = false;
        if (this.listOptions && this.listOptions.length) {
            this.listOptions[3].emit('RESET_MYSTERY');
        }
    },

    play(content, callback) {

        this.content = content;
        this.callback = callback;
        this.show();
        this.enter(content.mode);
    },

    enter(from = "normal") {
        this.gameSpeed = this.node.mainDirector.getGameSpeed();
        this.godKitchen.active = false;
        this.godKitchenNoKoi.active = true;
        this.godKitchenNoKoi.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
        this.optionList.forEach(it => {
            it.opacity = 255;
            it.active = true;
        });
        this.randomList = [0, 1, 2, 3, 4, 5];
        this.resetCutscene();
        if (from == "normal" && this.gameSpeed < 2) {
            this.node.soundPlayer.stopAllAudio();
            //if (this.node.soundPlayer) this.node.soundPlayer.playSFXMoveCamera();
            let animState = this.node.getComponent(cc.Animation).play("IntroFreeGameOption9983");
            animState.speed = 1 + this.gameSpeed;
        }
        else {
            this.node.getComponent(cc.Animation).play("FreeGameOptionNoIntro");
        }
        if (this.node.soundPlayer) this.node.soundPlayer.playSBGChooseOption();
        this.frameDecor.runAction(cc.fadeIn(0.2));
    },

    playOptionAnimation() {
        this.node.stopAllActions();
        this.node.runAction(
            cc.sequence(
                cc.delayTime(0.8),
                cc.callFunc(() => {
                    this.autoSelectFunc = setTimeout(() => {
                        this.selectOption(Math.floor(Math.random() * 7) + 1);
                    }, 11000);
                    this.isReady = true;
                    this.listOptions.forEach(item => {
                        item.emit('CAN_CLICK', true);
                    });

                })
            ));
        this.listOptions.forEach(item => {
            item.emit('SCROLLING_ROLL');
        });
    },

    onCompletedntroAnim() {
        this.playOptionAnimation();
    },

    selectOption(option) {
        if (!this.isReady || this.clicked) return;
        this.option = option;
        this.clicked = true;
        this.listOptions.forEach(item => {
            item.emit('CAN_CLICK', false);
        });
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXPickOption();
        this.node.gSlotDataStore.freeSpinOption = this.option;
        this.node.mainDirector.gameStateManager.triggerFreeSpinOption(this.option);
        if (option == 7) {
            if (this.node.soundPlayer) this.node.soundPlayer.playSFXRandomOption();
            this.listOptions[3].emit('ROLL_MYSTERY');
        }

        if (this.autoSelectFunc) {
            clearTimeout(this.autoSelectFunc);
        }
    },

    hideNode() {
        if (this.callback && typeof this.callback == "function") {
            this.node.emit("STOP");
            this.callback();
        }
        this.clicked = false;
        this.node.stopAllActions();
        this.node.runAction(
            cc.sequence(cc.delayTime(0.5),
                cc.callFunc(() => {
                    this.listOptions.forEach(item => {
                        item.emit('RESET_DATA');
                    });
                    this.node.active = false;
                    if (this.node.gSlotDataStore.currentGameMode == 'freeGame') {
                        if (this.node.soundPlayer) this.node.soundPlayer.stopAllAudio();
                        if (this.node.soundPlayer) this.node.soundPlayer.playMainBGM();
                    }
                })
            ));
    },

    exit() {
        const { fsoi } = this.node.gSlotDataStore;
        const fsoiArr = fsoi.split(';');
        const freeSpinList = { //TODO: need to request BE to send id instead.
            "25": 1,
            "20": 2,
            "15": 3,
            "13": 4,
            "10": 5,
            "6": 6,
        };
        this.playChoseAnim(fsoiArr[1], fsoiArr[2], freeSpinList[fsoiArr[0]]);
    },

    playChoseAnim(choseOption, multiId, spinTimeId) {
        const delayEach = 0.2;
        for (let i = 0; i < this.listOptions.length; i++) {
            let option = this.listOptions[i];
            // let optionName = option.name;
            if (OPTION[i] != choseOption) {
                // let fadeTime = this.getRandomDelay() * delayEach;
                // option.runAction(cc.fadeOut(fadeTime));
                option.opacity = 120;
            }
            else {
                this.chooseOption = option;
            }
        }

        if (choseOption == '7') {
            this.chooseOption.emit('STOP_MYSTERY', multiId, spinTimeId, this.playParticleKoi.bind(this));
        } else {
            this.node.stopAllActions();
            this.node.runAction(cc.sequence(cc.delayTime(this.listOptions.length * delayEach), cc.callFunc(this.playParticleKoi.bind(this))));
        }
    },

    playParticleKoi() {
        if (this.gameSpeed == 2) {
            this.hideNode();
        }
        else {
            const moveTime = 0.5 / (1 + this.gameSpeed);
            if (this.node.soundPlayer) this.node.soundPlayer.playSFXParticleKoi();
            this.particleKoi.node.position = this.node.parent.convertToNodeSpaceAR(this.chooseOption.parent.convertToWorldSpaceAR(this.chooseOption));
            let endPosition = this.godKitchenNoKoi.position;
            this.particleKoi.node.active = true;
            this.particleKoi.node.opacity = 0;
            this.particleKoi.resetSystem();
            this.particleKoi.node.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(() => {
                this.particleKoi.node.opacity = 255;
            }), cc.moveTo(moveTime, endPosition), cc.callFunc(() => {
                this.koiMoveOut();
            })));
        }
    },

    setGodKitchenType() {
        let skeleton = this.godKitchen.getComponent(sp.Skeleton);
        skeleton.setSkin(skinMapping[Number(this.option) - 1]);
        skeleton.setSlotsToSetupPose();
        this.godKitchenFly.node.active = true;
        const flySkeleton = this.godKitchenFly.node.getComponent(sp.Skeleton);
        flySkeleton.setSkin(flySkinMapping[Number(this.option) - 1]);
        flySkeleton.setSlotsToSetupPose();
        flySkeleton.setAnimation(0, 'animation', true);
        flySkeleton.timeScale = 2;
        skeleton.setAnimation(0, "Appear", false);
        skeleton.addAnimation(0, "Idle", true);
    },

    koiMoveOut() {
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXMoveKoi();
        console.log("Koi move out");
        this.particleKoi.node.active = false;
        this.godKitchen.active = true;
        this.setGodKitchenType();
        this.godKitchenNoKoi.runAction(cc.sequence(cc.fadeOut(0.5), cc.callFunc(() => {
            this.godKitchenNoKoi.opacity = 255;
            this.godKitchenNoKoi.active = false;
        })));
        this.node.runAction(cc.sequence(cc.delayTime(0.6), cc.callFunc(() => {
            this.listOptions.forEach(option => {
                option.runAction(cc.fadeOut(0.2));
            });
            this.frameDecor.runAction(cc.fadeOut(0.2), cc.callFunc(() => {

            }));
            let animState = this.node.getComponent(cc.Animation).play("KoiMoveOut");
            animState.speed = 0.2 + (0.2) * this.gameSpeed;
        })));

    },

    onKoiMoveOut() {
        this.godKitchenFly.tween(() => {
            this.godKitchen.active = false;
            this.godKitchen.position = this.koiPositionCache;
            this.hideNode();
        }, (2 - this.gameSpeed));
        //this.node.mainDirector.gameStateManager.triggerFreeSpinOption(this.option);
    },

    getRandomDelay() {
        let random = Math.floor(Math.random() * this.randomList.length);
        return this.randomList.splice(random, 1);
    }
});
