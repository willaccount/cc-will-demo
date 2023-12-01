const { convertAssetArrayToObject } = require('utils');
cc.Class({
    extends: require('SlotSoundPlayer'),

    properties: {
        bgmFree: {
            default: null,
            type: cc.AudioClip,
        },
        winAnimationLoop: {
            default: null,
            type: cc.AudioClip,
        },
        winAnimationEnd: {
            default: null,
            type: cc.AudioClip,
        },
        sfxMultiplier: {
            default: [],
            type: cc.AudioClip,
        },
        sfxParticleMultiplier: {
            default: null,
            type: cc.AudioClip,
        },
        sfxTotalWin: {
            default: null,
            type: cc.AudioClip,
        },
        sfxLenChau: {
            default: null,
            type: cc.AudioClip,
        },
        sfxCloud1: {
            default: null,
            type: cc.AudioClip,
        },
        sfxCloud2: {
            default: null,
            type: cc.AudioClip,
        },
        sfxPickOption: {
            default: null,
            type: cc.AudioClip,
        },
        sbgChooseOption: {
            default: null,
            type: cc.AudioClip,
        },
        sfxRandomOption: {
            default: null,
            type: cc.AudioClip,
        },
        sfxParticleKoi: {
            default: null,
            type: cc.AudioClip,
        },
        sfxMoveKoi: {
            default: null,
            type: cc.AudioClip,
        },
        sfxSubsymbolGrand: {
            default: null,
            type: cc.AudioClip,
        },
        sfxSubsymbolMajor: {
            default: null,
            type: cc.AudioClip,
        },
        sfxScatter: {
            default: [],
            type: cc.AudioClip,
        },
        sfxWinLine: {
            default: [],
            type: cc.AudioClip,
        },
        vfxFishFakeMiss: { default: null, type: cc.AudioClip },
        vfxFishRealMiss: { default: null, type: cc.AudioClip },
        vfxFishSilverMoving: { default: null, type: cc.AudioClip },
        vfxFishSilverWin: { default: null, type: cc.AudioClip },
        vfxFishGoldMoving: { default: null, type: cc.AudioClip },
        vfxFishGoldWin: { default: null, type: cc.AudioClip },
    },

    onExtendedLoad() {
        this.sfxMultiplierList = convertAssetArrayToObject(this.sfxMultiplier);

        this.registerEvents();
    },

    registerEvents() {
        this.node.on("STOP_ALL_AUDIO", this.stopAllAudio, this);
        this.node.on("PLAY_WIN_LOOP", this.playWinLoop, this);
        this.node.on("STOP_WIN_LOOP", this.stopWinLoop, this);
        this.node.on("PLAY_WIN_END", this.playWinEnd, this);
        this.node.on("PLAY_THEME_SOUND", this.playMainBGM, this);
    },

    playMainBGM(gameMode) {
        const currentGameMode = gameMode || this.node.gSlotDataStore.currentGameMode;
        let sound = this.bgmMain;
        if (currentGameMode === 'freeGame' && this.bgmFree) {
            sound = this.bgmFree;
        }
        this.playMusic(sound, true, this.MUSIC_VOLUME);
    },

    playWinLoop() {
        if (!this.isEnableSFX) return;
        if (this.audioWinLoopValue) {
            this.stopSound(this.audioWinLoopValue);
        }
        this.audioWinLoopValue = this.playSound(this.winAnimationLoop, false, 1);
    },

    stopWinLoop() {
        this.stopSound(this.audioWinLoopValue);
    },

    playWinEnd() {
        if (!this.isEnableSFX) return;
        if (this.audioWinEndValue) {
            this.stopSound(this.audioWinEndValue);
        }
        this.audioWinEndValue = this.playSound(this.winAnimationEnd, false, 1);
    },

    playMultiplier(multiplier = 2) {
        if (!this.isEnableSFX) return;
        this.playSound(this.sfxMultiplierList['wildx' + multiplier], false, 1);
    },

    playSubsymbolGrand(){
        if (!this.isEnableSFX) return;
        this.playSound(this.sfxSubsymbolGrand, false, 1);
    },
    
    playSubsymbolMajor(){
        if (!this.isEnableSFX) return;
        this.playSound(this.sfxSubsymbolMajor, false, 1);
    },
});