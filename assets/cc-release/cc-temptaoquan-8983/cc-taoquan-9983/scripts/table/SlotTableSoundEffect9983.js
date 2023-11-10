cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad() {
        this.node.on("REEL_STOP_SOUND", this.reelStopSound, this);
        this.node.on("STOP_SPINNING_SOUND", this.reelStopSpinningSound, this);
        this.node.on("TABLE_START_SOUND", this.reelStartSound, this);
    },

    reelStopSpinningSound() { },
    reelStartSound() {
        this.canGetFree = true;
    },

    reelStopSound({ matrix, count, context }) { // count: 1 -> 5;
        const realMatrix = matrix.slice()/*copy*/.splice(1, matrix.length - 2);/*remove first and last*/

        if (this.canGetFree) {
            if (realMatrix.indexOf("A") > -1) {
                if (context.node.mode == 'TURBO' || context.isFastToResult) { // play sound once 
                    if (count === 1) {
                        this.node.soundPlayer && this.node.soundPlayer.playSFXScatter(count - 1);
                    }
                } else {
                    this.node.soundPlayer && this.node.soundPlayer.playSFXScatter(count - 1);
                }
            } else {
                this.canGetFree = false; // scatters broken. not playsound anymore
            }
        }

        if (count >= this.node.reels.length) {
            this.allReelStopSound();
        }
    },
    allReelStopSound() { },
});
