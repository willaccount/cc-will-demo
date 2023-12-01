
const mythicalOption = 7;
cc.Class({
    extends: require('CutsceneMode'),

    properties: {
        optionPrefabs: [cc.Node],
        mysteryIndex: 7,
    },

    init(mainDirector) {
        let gameConfig = mainDirector.node.config;
        this.mysteryNode = this.optionPrefabs[this.mysteryIndex];
    },

    enter() {
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
                this.exit();
                this.resetAllOptions();
            });
        } else {
            this.exit();
            this.tweenReset = cc.tween(this.node);
            this.tweenReset
                .delay(2)
                .call(() => {
                    this.resetAllOptions();
                })
                .start();
        }
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
