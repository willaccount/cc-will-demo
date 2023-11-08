

cc.Class({
    extends: cc.Component,

    properties: {
        sfxClick: {
            default: null,
            type: cc.AudioClip,
        },
        bgmMain: {
            default: null,
            type: cc.AudioClip,
        },
        storageKeyBGM: "enableBackgroundMusic",
        storageKeySFX: "enableSound"
    },

    onLoad () {
        this.setDefaultVolume();
        this.isEnableBGM = false;
        this.isEnableSFX = false;
        this.node.on("PLAY_SOUND",this.playSound,this);
        this.node.on("STOP_SOUND",this.stopSound,this);
        this.node.on("PLAY_CLICK",this.playSFXClick,this);
        this.node.on("PLAY_SFX",this.playSFX,this);
        this.emit = this.node.emit;
        this.node.soundPlayer = this;
        this.isWebSoundClient2 = cc.sys.isNative && typeof(closeCreatorGame) === 'function';
        this.storageKeyBGM = this.isWebSoundClient2 ? "user_bg_music": this.storageKeyBGM;
        this.storageKeySFX = this.isWebSoundClient2 ? "user_fx_sound": this.storageKeySFX;
        this.isEnableBGM = this.readBGMKey();
        this.isEnableSFX = this.readSFXKey();
        this.onExtendedLoad();
    },

    readBGMKey() {
        const isEnableBGM = cc.sys.localStorage.getItem(this.storageKeyBGM);
        const result = (isEnableBGM != null) ? JSON.parse(isEnableBGM) : true;
        return result;
    },

    readSFXKey() {
        const isEnableSFX = cc.sys.localStorage.getItem(this.storageKeySFX);
        const result = (isEnableSFX != null) ? JSON.parse(isEnableSFX) : true;
        return result;
    },
    
    setDefaultVolume() {
        const {MUSIC_VOLUME, SOUND_EFFECT_VOLUME} = this.node.config || {};
        this.MUSIC_VOLUME = MUSIC_VOLUME || 0.5;
        this.SOUND_EFFECT_VOLUME = SOUND_EFFECT_VOLUME || 1;
        cc.audioEngine.setEffectsVolume(this.SOUND_EFFECT_VOLUME);
        cc.audioEngine.setMusicVolume(this.MUSIC_VOLUME);
    },
    onExtendedLoad(){
        
    },
    start() {
        
    },
    sfxToggle() {
        this.isEnableSFX = !this.isEnableSFX;
        if (this.node.gSlotDataStore) this.node.gSlotDataStore.isEnableSFX = this.isEnableSFX;

        if (this.isWebSoundClient2) {
            cc.sys.localStorage.setItem(this.storageKeySFX, this.isEnableSFX ? "1" : "0");
        } else {
            cc.sys.localStorage.setItem(this.storageKeySFX, this.isEnableSFX);
        }
        
        if (!this.isEnableSFX) {
            cc.audioEngine.stopAllEffects();
        }
    },
    bgmToggle() {
        this.isEnableBGM = !this.isEnableBGM;
        if (this.node.gSlotDataStore) this.node.gSlotDataStore.isEnableBGM = this.isEnableBGM;

        if (this.isWebSoundClient2) {
            cc.sys.localStorage.setItem(this.storageKeyBGM, this.isEnableBGM ? "1" : "0");
        } else {
            cc.sys.localStorage.setItem(this.storageKeyBGM, this.isEnableBGM);
        }

        if (this.isEnableBGM) {
            this.playMainBGM();
        } else {
            cc.audioEngine.pauseMusic();
        }
    },
    playMusic(audio, loop = true, volume = this.MUSIC_VOLUME) {
        if (!this.isEnableBGM) return;
        if (cc.audioEngine.isMusicPlaying() && this.currentBGM === audio) {
            return; // return if this bgm audio is playing
        }
        cc.audioEngine.playMusic(audio, loop);
        cc.audioEngine.setMusicVolume(volume);
        this.currentBGM = audio;
    },
    playSFXClick() {
        if (!this.isEnableSFX) return;
        cc.audioEngine.playEffect(this.sfxClick);
    },
    playSFX(sfx) {
        if (!this.isEnableSFX) return;
        return cc.audioEngine.playEffect(sfx);
    },
    playMainBGM() {
        if (!this.isEnableBGM) return;
        this.playMusic(this.bgmMain, true);
    },
    playSound(sound, loop = false, volume = this.SOUND_EFFECT_VOLUME) {
        if (!this.isEnableSFX) return;
        return cc.audioEngine.play(sound, loop, volume);
    },
    stopSound(soundkey) {
        cc.audioEngine.stop(soundkey);
    },
    stopAllAudio() {
        cc.audioEngine.stopAll();
    },
});
