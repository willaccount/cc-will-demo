const skinMapping = ["chep_bac", "chep_do", "chep_den", "chep_xanhduong", "chep_vang", "chep_xanhla", "chep_tim"];
const flySkinMapping = ["Ca_Bac", "Ca_Do", "Ca_Den", "Ca_XanhDuong", "Ca_Vang", "Ca_XanhLa", "Ca_Tim"];

cc.Class({
    extends: require('CutsceneMode'),

    properties: {
        optionPrefabs: [cc.Node],
        mysteryIndex: 6,
    },

    init(mainDirector) {
        let gameConfig = mainDirector.node.config;
        this.mysteryNode = this.optionPrefabs[this.mysteryIndex];
    },

    enter() {
        if (this.content) {
            cc.log('show result free game option');
            this.isShowingResult = true;
            this.optionPrefabs[this.mysteryIndex].emit("STOP_SPINNING_MYSTERY_REELS", this.content);
        } else {
            this.isShowingResult = false;
            cc.log('enter free game option');
        }
    },

    onOptionSelected(touchEvent, customData) {
        this.node.mainDirector.getComponent('Director').gameStateManager.triggerFreeSpinOption(customData);
        if (customData === this.mysteryIndex.toString()) {
            this.getRandomMysteryChoices(customData);
        }
        else {
            cc.log(customData);
        }
    },

    getRandomMysteryChoices(index) {
        this.optionPrefabs[index].emit("START_SPINNING_MYSTERY_REELS");
    },
});
