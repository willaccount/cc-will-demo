
/*
    New Rule: Play sound when win above 3 symbol A, R - 5 symbol JP
*/
cc.Class({
    extends: cc.Component,

    properties: {
        sfxBonuses: {
            default: [],
            type: cc.AudioClip,
        },
        sfxScatters: {
            default: [],
            type: cc.AudioClip,
        },
        sfxJackpots: {
            default: [],
            type: cc.AudioClip,
        },
        startSoundBonus: 3,
        startSoundScatter: 3,
        startSoundJackpot: 5,
    },

    onLoad() {
        const payLineMatrix = this.node.config.PAY_LINE_MATRIX;
        this.payLineMatrixForCompare = [];
        if (payLineMatrix) {
            Object.keys(payLineMatrix).forEach(key => {
                this.payLineMatrixForCompare.push(payLineMatrix[key].join());
            });
        }
    },

    start () {
        this.node.on('TABLE_START_SOUND',this.reelStartSound,this);
        this.node.on('REEL_STOP_SOUND',this.reelStopSound,this);
    },

    reelStartSound() {
        this.countBonus = 0;
        this.countScatter = 0;
        this.countJackpot = 0;

        this.playedSoundBonus = [];
        this.playedSoundScatter = [];
        this.playedSoundJackpot = [];

        this.bonusPlaylist = [...this.sfxBonuses];
        this.scatterPlaylist = [...this.sfxScatters];
        this.jackpotPlayList = [...this.sfxJackpots];

        this.jackpotLine = '';
    },

    reelStopSound({matrix, count}) {
        let jpIndex = -1;
        for (let k = 1; k <= matrix.length - (matrix.length === 5 ? 2 : 1); k++) {
            let value = matrix[k];
            if (value === 'R') {
                this.countBonus++;
            } else if (value === 'A') {
                this.countScatter++;
            } else if (value === 'JP') {
                this.countJackpot++;
                jpIndex = k - 1;
            }
        }

        this.jackpotLine += (count > 1 ? ',' : '') + jpIndex;

        this._playSound(this.countBonus, this.startSoundBonus, this.playedSoundBonus, this.bonusPlaylist);
        this._playSound(this.countScatter, this.startSoundScatter, this.playedSoundScatter, this.scatterPlaylist);
        if (this.payLineMatrixForCompare.includes(this.jackpotLine)) {
            this._playSound(this.countJackpot, this.startSoundJackpot, this.playedSoundJackpot, this.jackpotPlayList);
        }
    },

    _playSound(countSymbol, startSoundSymbol, playedSoundSymbol, sfxSymbols) {
        if (countSymbol >= startSoundSymbol && !playedSoundSymbol.includes(countSymbol) && sfxSymbols.length) {
            playedSoundSymbol.push(countSymbol);
            let sound = sfxSymbols.shift();
            if (sound && this.node.soundPlayer) {
                this.node.soundPlayer.playSFX(sound);
            }
        }
    }
});
