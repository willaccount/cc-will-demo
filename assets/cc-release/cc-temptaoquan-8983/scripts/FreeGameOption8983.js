
const mythicalOption = 7;
cc.Class({
    extends: require('CutsceneMode'),

    properties: {
        optionPrefabs: [cc.Node],
        mysteryIndex: 7,
        godKitchenIdle: sp.Skeleton,
        godKitchenFlyOut: sp.Skeleton,
        godKitchenFlyIn: sp.Skeleton
    },

    init(mainDirector) {
        let gameConfig = mainDirector.node.config;
        this.mysteryNode = this.optionPrefabs[this.mysteryIndex];
        this.animation = this.getComponent(cc.Animation);
    },

    enter() {
        this.godKitchenIdle.node.active = true;
        this.godKitchenIdle.setAnimation(0, "animation", true);

        if (!this.content) {
            this.isShowingResult = false;
            this.onCompleteFreeGameOption = this.callback;
        } else {
            let { optionResult } = this.content;
            this.showResultFreeSpinOption(optionResult);
        }
    },

    onOptionSelected(touchEvent, customData) {
        const optionIndexSelected = Number(customData) - 1;
        const isMysteryOption = customData === this.mysteryIndex.toString();

        for (let i = 0; i < this.optionPrefabs.length; ++i) {
            const isOptionSelected = i === optionIndexSelected;
            this.optionPrefabs[i].emit("SELECT_OPTION", isOptionSelected);
        }
        if (isMysteryOption) {
            this.getRandomMysteryChoices(customData);
        }
        this.delayTween = cc.tween(this.node);
        this.delayTween.delay(1)
            .call(() => {
                this.node.mainDirector.getComponent('Director').gameStateManager.triggerFreeSpinOption(customData);
            })
            .start();
    },

    getRandomMysteryChoices() {
        this.optionPrefabs[this.mysteryIndex - 1].emit("START_SPINNING_MYSTERY_REELS");
    },

    showResultFreeSpinOption(optionResult) {
        this.isShowingResult = true;
        let { spinAmount, spinAmountIndex, multiplierIndex } = optionResult

        if (mythicalOption == spinAmountIndex) {
            this.optionPrefabs[this.mysteryIndex - 1].emit("STOP_SPINNING_MYSTERY_REELS", this.content, () => {
                this.playGodKitchenFlyingAnim(spinAmountIndex);
                this.resetAllOptions();
            });
        } else {
            this.playGodKitchenFlyingAnim(spinAmountIndex);
            this.tweenReset = cc.tween(this.node);
            this.tweenReset
                .delay(2)
                .call(() => {
                    this.resetAllOptions();
                })
                .start();
        }
    },

    playGodKitchenFlyingAnim(optionIndex) {
        this.godKitchenFlyOut.node.active = true;
        this.godKitchenIdle.node.active = false;

        switch (optionIndex) {
            case 1:
                this.godKitchenFlyOut.setSkin("chep_bac");
                break;
            case 2:
                this.godKitchenFlyOut.setSkin("chep_do");
                break;
            case 3:
                this.godKitchenFlyOut.setSkin("chep_den");
                break;
            case 4:
                this.godKitchenFlyOut.setSkin("chep_xanhduong");
                break;
            case 5:
                this.godKitchenFlyOut.setSkin("chep_vang");
                break;
            case 6:
                this.godKitchenFlyOut.setSkin("chep_xanhla");
                break;
            case 7:
                this.godKitchenFlyOut.setSkin("chep_tim");
                break;
        }

        this.godKitchenFlyOut.setAnimation(0, "Appear", false);
        this.godKitchenFlyOut.addAnimation(0, "Idle", true);

        this.exit();
    },

    exit() {
        if (this.callback && typeof this.callback == "function") {
            this.node.emit("STOP");
            this.callback();
        }

        this.onCompleteFreeGameOption && this.onCompleteFreeGameOption();
        this.onCompleteFreeGameOption = null;
        this.node.active = false;
    },

    resetAllOptions() {
        this.optionPrefabs.forEach(option => {
            option.emit("RESET_OPTION");
        });
    }
});
