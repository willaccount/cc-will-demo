
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
        if(this.optionPrefabs[customData].getComponent("OptionController8983").getCanClick()) {
            for(let i = 0; i < this.optionPrefabs.length; ++i) {
                if(i === customData) {
                    this.optionPrefabs[i].getComponent("OptionController8983").onOptionSelected(true);
                } else {
                    this.optionPrefabs[i].getComponent("OptionController8983").onOptionSelected(false);
                }
            }
            if (customData === this.mysteryIndex.toString()) {
                this.getRandomMysteryChoices(customData);
            }
            this.node.mainDirector.getComponent('Director').gameStateManager.triggerFreeSpinOption(customData);
        }
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
            });
        } else {

            this.exit();
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
    }
});
