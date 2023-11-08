cc.Class({
    extends: require('WebSoundPlayer').WebSoundPlayer,

    playMainBGM() {
        const mode = this.node.gSlotDataStore.currentGameMode;
        if (!this.isEnableBGM) return;
        let soundBG = this.bgmMain;
        if (mode == 'freeGame') {
            soundBG = this.bgmFree;
        } else if (mode == "bonusGame") {
            soundBG = this.bgmBonus;
        }
        soundBG = soundBG || this.bgmMain; // ! cover invalid sounds
        if (this.currentBGM === soundBG) return;
        if (this.currentBGM && this.currentBGM !== soundBG) {
            const dur = 0.5;
            this.fadeMusicTo(dur, 0);
            cc.tween(this.node)
                .delay(dur)
                .call(() => {
                    this.playMusic(soundBG, true);
                    this.tweenMusic = this.fadeMusicTo(dur, this.MUSIC_VOLUME);
                })
                .delay(dur)
                .call(() => { this.tweenMusic = null; })
                .start();
        } else {
            this.playMusic(soundBG, true, this.MUSIC_VOLUME);
        }
    },

    getMusicCurrentTime() {
        if (this.webSound) {
            return this.musicInstance.seek();
        }
        else {
            return cc.audioEngine.getCurrentTime(this.ccMusic);
        }
    },

    getSFXCurrentTime(id) {
        if (!id) return 0;
        if (this.webSound) {
            return 0; //TODO support for howler;
        }
        else {
            let progress = cc.audioEngine.getCurrentTime(id);
            return progress;
        }
    },

    // Empty function for override
    playSfxTurboClick() {
        this.playSFXClick();
    },
    playSfxPopupOpen() {},
    playSfxPopupClose() {},
    playSfxResult() {},
    playSoundNearWin(){},
    stopSoundNearWin(){}
});
