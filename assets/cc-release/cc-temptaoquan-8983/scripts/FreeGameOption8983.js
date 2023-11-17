const skinMapping = ["chep_bac", "chep_do", "chep_den", "chep_xanhduong", "chep_vang", "chep_xanhla", "chep_tim"];
const flySkinMapping = ["Ca_Bac", "Ca_Do", "Ca_Den", "Ca_XanhDuong", "Ca_Vang", "Ca_XanhLa", "Ca_Tim"];

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
        if (this.content) {
            cc.log('show result free game option');
            this.isShowingResult = true;
            this.optionPrefabs[this.mysteryIndex - 1].emit("STOP_SPINNING_MYSTERY_REELS", this.content, () => {
                cc.log("log");
                this.exit();
            });
        } else {
            this.isShowingResult = false;
            cc.log('enter free game option');

            this.onCompleteFreeGameOption = this.callback;
        }
    },

    onOptionSelected(touchEvent, customData) {
        this.node.mainDirector.getComponent('Director').gameStateManager.triggerFreeSpinOption(customData);
        if(customData === this.mysteryIndex.toString()) {
            this.getRandomMysteryChoices(customData);
        } else {
            this.node.emit("STOP");
        }
    },

    getRandomMysteryChoices() {
        this.optionPrefabs[this.mysteryIndex - 1].emit("START_SPINNING_MYSTERY_REELS");
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
