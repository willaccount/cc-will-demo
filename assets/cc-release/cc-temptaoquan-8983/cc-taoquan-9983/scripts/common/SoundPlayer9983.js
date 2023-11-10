
const {convertAssetArrayToObject} = require('utils');
cc.Class({
    extends: require('WebSoundPlayer').WebSoundPlayer,

    properties: {
        bgmFree: {
            default: null,
            type: cc.AudioClip,
        },
        winAnimationLoop:{
            default: null,
            type: cc.AudioClip,
        },
        winAnimationEnd:{
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
        sfxCloud1:{
            default: null,
            type: cc.AudioClip,
        },
        sfxCloud2:{
            default: null,
            type: cc.AudioClip,
        },
        sfxPickOption:{
            default: null,
            type: cc.AudioClip,
        },
        sbgChooseOption:{
            default: null,
            type: cc.AudioClip,
        },
        sfxRandomOption:{
            default: null,
            type: cc.AudioClip,
        },
        sfxParticleKoi:{
            default: null,
            type: cc.AudioClip,
        },
        sfxMoveKoi:{
            default: null,
            type: cc.AudioClip,
        },
        sfxSubsymbolGrand:{
            default: null,
            type: cc.AudioClip,
        },
        sfxSubsymbolMajor:{
            default: null,
            type: cc.AudioClip,
        },
        sfxScatter:{
            default: [],
            type: cc.AudioClip,
        },
        sfxWinLine:{
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
        this.node.on("STOP_ALL_AUDIO",this.stopAllAudio,this);
        this.node.on("PLAY_WIN_LOOP",this.playWinLoop,this);
        this.node.on("STOP_WIN_LOOP",this.stopWinLoop,this);
        this.node.on("PLAY_WIN_END",this.playWinEnd,this);
        this.node.on("PLAY_SOUND_BACKGROUND",this.playMainBGM,this);
        this.node.on("PLAY_SUBSYMBOL_MAJOR", (ev)=>{
            this.playSubsymbolMajor();
            ev.stopPropagation();
        });
        this.node.on("PLAY_SUBSYMBOL_GRAND", (ev)=>{
            this.playSubsymbolGrand();
            ev.stopPropagation();
        });
    },

    playMainBGM(gameMode) {
        const currentGameMode = gameMode || this.node.gSlotDataStore.currentGameMode;
        let sound = this.bgmMain;
        if (currentGameMode === 'freeGame') {
            if (this.bgmFree) sound = this.bgmFree;
        }
        this.playMusic(sound,true,this.MUSIC_VOLUME);
    },

    playWinLoop() {
        if (!this.isEnableSFX) return;
        if (this.audioWinLoopValue) {
            this.stopSound(this.audioWinLoopValue);
        }
        this.audioWinLoopValue = this.playSound(this.winAnimationLoop, true, 1);
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
    
  
    stopWinEnd() {
        this.stopSound(this.audioWinEndValue);
    },

    playSFXWinLine(index = 1){
        if (!this.isEnableSFX) return;
        this.playSound(this.sfxWinLine[index - 1], false, 1);
    },
    

    playParticleMultiplier() {
        if (!this.isEnableSFX) return;
        this.playSound(this.sfxParticleMultiplier, false, 1);
    },
    playMultiplier(value = 2) {
        if (!this.isEnableSFX) return;
        this.playSound(this.sfxMultiplierList['wildx'+value], false, 1);
    },
    playSFXTotalWin() {
        if (!this.isEnableSFX) return;
        this.audioTotalWin = this.playSound(this.sfxTotalWin, false, 1);
    },
    stopSFXTotalWin() {
        if (this.audioTotalWin) {
            this.stopSound(this.audioTotalWin);
            this.audioTotalWin = null;
        }
    },
    playSFXLenChau() {
        if (!this.isEnableSFX) return;
        this.playSound(this.sfxLenChau, false, 1);
    },
    playSFXCloud1(){
        if (!this.isEnableSFX) return;
        this.playSound(this.sfxCloud1, false, 1);
    },
    playSFXCloud2(){
        if (!this.isEnableSFX) return;
        this.playSound(this.sfxCloud2, false, 1);
    },
    playSFXPickOption(){
        if (!this.isEnableSFX) return;
        this.playSound(this.sfxPickOption, false, 1);
    },
    playSBGChooseOption(){
        if (!this.isEnableBGM) return;
        this.playMusic(this.sbgChooseOption,true,this.MUSIC_VOLUME);
    },
    playSFXRandomOption(){
        if (!this.isEnableSFX) return;
        this.playSound(this.sfxRandomOption, false, 1);
    },
    playSFXParticleKoi(){
        if (!this.isEnableSFX) return;
        this.playSound(this.sfxParticleKoi, false, 1);
    },
    playSFXMoveKoi(){
        if (!this.isEnableSFX) return;
        this.playSound(this.sfxMoveKoi, false, 1);
    },
    playSubsymbolGrand(){
        if (!this.isEnableSFX) return;
        this.playSound(this.sfxSubsymbolGrand, false, 1);
    },
    playSubsymbolMajor(){
        if (!this.isEnableSFX) return;
        this.playSound(this.sfxSubsymbolMajor, false, 1);
    },

    playSFXScatter(index = 0){
        if (!this.isEnableSFX) return;
        this.playSound(this.sfxScatter[index], false, 1);

    },

    playSfxFishFlying(isGoldFish = false) {
        if (!this.isEnableSFX) return;
        this.playSFX(isGoldFish ? this.vfxFishGoldMoving : this.vfxFishSilverMoving);
    },

    playSfxGoldFishWin() {
        if (!this.isEnableSFX) return;
        this.playSFX(this.vfxFishGoldWin);
    },

    playSfxSilverFishWin() {
        if (!this.isEnableSFX) return;
        this.playSFX(this.vfxFishSilverWin);
    },

    playSfxRealFishMiss() {
        if (!this.isEnableSFX) return;
        this.playSFX(this.vfxFishRealMiss);
    },

    playSfxFakeFishMiss() {
        if (!this.isEnableSFX) return;
        this.playSFX(this.vfxFishFakeMiss);
    },
});
