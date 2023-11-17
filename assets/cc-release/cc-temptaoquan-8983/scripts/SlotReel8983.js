cc.Class({
    extends: require('SlotReelv2'),

    setStepToStop() {
        let bufferStepFreeGame = 0;
        if ((this.col == 0 || this.col == 4) && this.isFreeMode) {
            bufferStepFreeGame = 1;
        }
        this.step = (this.curentConfig.STEP_STOP * 2) - (this.totalNumber + bufferStepFreeGame);
    },
});