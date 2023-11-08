

cc.Class({
    extends: cc.Component,

    properties: {
        sfxReelSpinning: {
            default: null,
            type: cc.AudioClip,
        },
        sfxReelStop: {
            default: null,
            type: cc.AudioClip,
        },
        sfxBonus1: {
            default: null,
            type: cc.AudioClip,
        },
        sfxBonus2: {
            default: null,
            type: cc.AudioClip,
        },
        sfxBonus3: {
            default: null,
            type: cc.AudioClip,
        },
        sfxScatter1: {
            default: null,
            type: cc.AudioClip,
        },
        sfxScatter2: {
            default: null,
            type: cc.AudioClip,
        },
        sfxScatter3: {
            default: null,
            type: cc.AudioClip,
        },

        bonusSymbol: 'R',
        scatterSymbol: 'A',
    },

    start () {
        this.node.on("REEL_STOP_SOUND",this.reelStopSound,this);
        this.node.on("TABLE_START_SOUND",this.reelStartSound,this);
    },
    reelStartSound() {
        this.countBonus = 0;
        this.countScatter = 0;
        if (this.node.soundPlayer)
            this.soundSpinId = this.node.soundPlayer.playSFX(this.sfxReelSpinning);
    },
    reelStopSound({matrix, count}) {
        let isSpecialSoundBonus = null;
        let isSpecialSoundScatter = null;
        for (let k = 1; k < matrix.length-1; k++) {
            let value = matrix[k];
            if (value === this.bonusSymbol) {
                this.countBonus++;
                isSpecialSoundBonus = value;
            } else if (value === this.scatterSymbol) {
                this.countScatter++;
                isSpecialSoundScatter = value;
            }
        }

        if (count - this.countBonus > 2) {
            isSpecialSoundBonus = null;
        }
        if (count - this.countScatter > 2) {
            isSpecialSoundScatter = null;
        }

        if (isSpecialSoundBonus) {
            let sfxSpecia = this.sfxBonus1;
            if (this.countBonus >= 3) {
                sfxSpecia = this.sfxBonus3;
            } else if (this.countBonus == 2) {
                sfxSpecia = this.sfxBonus2;
            }
            if (this.node.soundPlayer) this.node.soundPlayer.playSFX(sfxSpecia);
        } else if (isSpecialSoundScatter) {
            let sfxSpecia = this.sfxScatter1;
            if (this.countScatter >= 3) {
                sfxSpecia = this.sfxScatter3;
            } else if (this.countScatter == 2) {
                sfxSpecia = this.sfxScatter2;
            }
            if (this.node.soundPlayer) this.node.soundPlayer.playSFX(sfxSpecia);
        } else {
            if (this.node.soundPlayer) this.node.soundPlayer.playSFX(this.sfxReelStop);
        }

        if (count >= this.node.reels.length) {
            this.node.soundPlayer.stopSound(this.soundSpinId);
            this.allReelStopSound();
        }
    },
    allReelStopSound() {},
});
