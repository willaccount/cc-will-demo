/* global Howl */

const SoundStateEnum = {
    NONE: 0,
    PLAYING: 1
};

const SoundStorageKeys = {
    ENABLE_BGM: "enableBackgroundMusic",
    ENABLE_SFX: "enableSound",
};

const WebSoundPlayer = cc.Class({
    extends: require('SoundPlayer'),
    properties: {
        gameNode: {
            type: cc.Node,
            default: null,
        },

        keepAudioSession: true
    },

    ctor()
    {
        this.webSound = false;
        this.musicInstance = null;

        // for fixing safari on ios 13, only for iframe only
        this.isWebSoundEnable = cc.sys.isBrowser && typeof Howl !== 'undefined';

        this.soundLoadCount = 0;
        this.totalSound = 0;
        this.isAllWebSoundLoaded = false;
        this.loadSoundCompleteHdl = this.onWebSoundLoadComplete.bind(this);
        this.ccMusic = -1;
        this.musicOffset = 0;
        this.musicVolume = 1;
        this.effectVolume = 1;
        this.isGameActive = true;
        this.howlMap = {};
        this.bgMusicId = -1;
        this.playingSounds = [];
        this.bgMusicUUID = 0;
        this.releaseCocosSound = true;
        this._timer = 0;
        this._sfxCacheGesture = [];
        this._resumeWithGesture = this.resumeWithGesture.bind(this);
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad()
    {
        if (this.isWebSoundEnable)
        {
            let session = window['_v_audio_backgroud_session'];
            if (session)
            {
                this.bgMusicUUID = session.uuid;
                this.bgMusicId = session.bgMusicId;
                this.musicInstance = session.instance;
                this.howlMap[session.uuid] = session.instance;
            }
        }

        this.currentBGM = null;
        this._super();
        this.musicVolume = this.MUSIC_VOLUME;
        this.effectVolume = this.SOUND_EFFECT_VOLUME;
        // init config
        if (this.isWebSoundEnable)
        {
            this.webSound = true;
            this.loadWebSounds(this.gameNode || this.node, null);
            const Howler = window.Howler;
            this._hasAudioContext = !!(Howler && Howler.ctx && Howler.ctx.state == "running");
            if (!this._hasAudioContext) {
                this.node.width = 2024;
                this.node.height = 2000;
                this.node.on(cc.Node.EventType.TOUCH_END, this._resumeWithGesture, this, true);

                // this._onOrientationChange();
                // window.addEventListener('orientationchange', this._onOrientationChange);

                const handImage = document.getElementById('mask');
                if (handImage) handImage.addEventListener("touchstart", this._resumeWithGesture);
            }
        }
        cc.game.on(cc.game.EVENT_SHOW, this.onGameShow, this);
        cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);
    },

    update(dt) {
        if (this._hasAudioContext || !this.isGameActive || !this.webSound) return;
        this._timer += dt;
        this._waitingGestureSound();
    },
    _waitingGestureSound() {
        for (let index = this._sfxCacheGesture.length - 1; index >= 0; index--) {
            const { startTime, duration, loop } = this._sfxCacheGesture[index];
            const endTime = startTime + duration;
            if (!loop && this._timer > endTime) {
                this._sfxCacheGesture.splice(index, 1);
            }
        }
    },          
    _onOrientationChange() {
        if (this._hasAudioContext) return;
        const handImage = document.getElementById('mask');
        const divGestureSound = document.getElementById('div_gesture_sound');
        if (!divGestureSound) return;
        if (!handImage || handImage.style.display == 'none') {
            divGestureSound.style.display = 'block';
        } else {
            divGestureSound.style.display = 'none';
        }
    },
    resumeWithGesture() {
        if (this._hasAudioContext) return;
        this._hasAudioContext = true;
        this._sfxCacheGesture.forEach(soundObject => {
            const { startTime, duration, loop, sound, volume } = soundObject;
            const offset = (this._timer - startTime) % duration;
            const endTime = startTime + duration;
            if (!loop && this._timer > endTime) return;
            sound.loop(loop);
            sound.volume(volume);
            sound.play();
            sound.seek(offset);
        });
        this._sfxCacheGesture = [];

        const divGestureSound = document.getElementById('div_gesture_sound');
        if (divGestureSound) divGestureSound.style.display = 'none';

        const handImage = document.getElementById('mask');
        if (handImage) handImage.removeEventListener('touchstart', this._resumeWithGesture);

        window.removeEventListener("orientationchange", this._onOrientationChange);
        this.node.off(cc.Node.EventType.TOUCH_END, this._resumeWithGesture, this, true);
    },
    // need to debug memory for muliple loading call -----
    loadWebSounds(gameNode)
    {
        this.soundLoadCount = 0;
        this.gameNode = gameNode;
        let sounds = [
            // {id: 'test_sound', src: 'res/import/df/df3d8497-4e8c-4a25-8fb9-e5b70e8c3f88.mp3'}
        ];
        var soundMap = {};
        var soundUuids = [];
        this.loadedSoundMap = {};
        for (let i in cc.loader._cache)
        {
            let clip = cc.loader._cache[i]._owner;
            if (clip instanceof cc.AudioClip)
            {
                if (clip._nativeAsset instanceof window.Howl) {
                    this.howlMap[clip._uuid] = clip._nativeAsset;
                    this.loadedSoundMap[clip.name] = true;
                    continue;
                }
                
                // dont load the cached background audio session
                if (this.bgMusicUUID && clip._uuid == this.bgMusicUUID)
                {
                    continue;
                }
                if (!soundMap[clip.url])
                {
                    sounds.push({uuid: clip._uuid, name: clip.name, src: clip.url});
                    soundMap[clip.url] = true;
                    soundUuids.push(clip._uuid);

                    this.loadedSoundMap[clip.name] = false;
                }

            }
        }

        if (this.releaseCocosSound) cc.loader.release(soundUuids);

        this.totalSound = sounds.length;
        if (this.totalSound == 0) this.isAllWebSoundLoaded = true; 
        cc.log('this.totalSound === ' + this.totalSound);
        for (var i = 0; i < sounds.length; i++)
        {
            let sound = sounds[i];
            let howl = new Howl({
                src: [sound.src],
                preload: true
            });

            howl.once('load', this.onWebSoundLoadComplete.bind(this, sound.name));
            this.howlMap[sound.uuid] = howl;
        }

        // init user gesture for audio to start
        this.waitForGesture(gameNode);
    },

    waitForGesture(gameNode) {
        if (!window['_v_audio_backgroud_session']) gameNode.on(cc.Node.EventType.TOUCH_END, this.startPlayWithUserGesture, this, true);
    },

    onWebSoundLoadComplete(e)
    {
        this.soundLoadCount++;
        if (!this.gameNode)
        {
            // trick to handle bug from preloading scene. Will resolve it later.
            return;
        }
        this.loadedSoundMap[e] = true;

        var fail = '';
        for (let k in this.loadedSoundMap)
        {
            if (!this.loadedSoundMap[k])
            {
                fail = k;
                break;
            }
        }
        if (window && window['vtrace']) window['vtrace']('fail: ' + fail);

        if (this.soundLoadCount == this.totalSound)
        {
            this.isAllWebSoundLoaded = true;

            // all sounds loaded - switch to websound
            cc.audioEngine.stopAllEffects();
            cc.audioEngine.stopMusic();
            if (this.isEnableBGM)
            {
                if (!this.currentBGM) this.playMusic(this.bgmMain, true, -1, this.musicOffset);
                else this.playMusic(this.currentBGM, true, -1, this.musicOffset);
            }
        }
    },

    playHowl(howl, options, id = -1)
    {
        if (options.loop) howl.loop(options.loop);
        if (options.volume) howl.volume(options.volume);
        if (options.offset) howl.seek(options.offset);
        return id >= 0 ? howl.play(id) : howl.play();
    },

    onGameShow()
    {
        cc.log("WebSound: onGameShow");
        this.isGameActive = true;
        if (this.webSound)
        {
            this.resumeContext().then(()=>{
                if (this.isEnableBGM) this.resumeMusic();
                // resume all sound effects
                for (var i in this.howlMap )
                {
                    let instance = this.howlMap[i];
                    if (instance == this.musicInstance) continue;
                    if (instance['_vorgVolume'])
                    {
                        instance.volume(instance['_vorgVolume']);
                        delete instance['_vorgVolume'];
                        if (instance.pausedOnHide) {
                            instance.play();
                            instance.pausedOnHide = false;
                        }
                    }
                }
            });
        } else {
            if (!this.isEnableBGM) {
                this.stopMusic();
            }
        }
    },

    resumeContext() {
        const Howler = window.Howler;
        if (Howler && Howler.ctx && Howler.ctx.state != "running") {
            return Howler.ctx.resume();
        } 

        return Promise.resolve();
    },

    onGameHide()
    {
        cc.log("WebSound: onGameHide");
        this.isGameActive = false;
        if (this.webSound)
        {
            if (this.musicInstance) this.pauseMusic();
            // pause all sound effects
            for (var i in this.howlMap) {
                let instance = this.howlMap[i];
                if (instance != this.musicInstance)
                {
                    instance['_vorgVolume'] = instance.volume();
                    instance.volume(0);
                    if (instance.playing()) {
                        instance.pause();
                        instance.pausedOnHide = true;
                    }
                }
            }
        }
    },

    startPlayWithUserGesture()
    {
        if (!this.isAllWebSoundLoaded) return;
        if (!this.currentBGM) this.currentBGM = this.bgmMain;
        if (!this.currentBGM)
        {
            cc.log('WebSoundPlayer::startPlayWithUserGesture this.bgmMain is not initialized.');
            return;
        }

        if (this.musicInstance)
        {
            this.musicInstance.stop();
        }

        this.gameNode.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(()=>{
            this.playMusic(this.currentBGM, true, -1, this.musicOffset);

            if (this.musicInstance && this.musicInstance.playing())
            {
                this.gameNode.off(cc.Node.EventType.TOUCH_END, this.startPlayWithUserGesture, this, true);
            }

            if (!this.isEnableBGM && this.musicInstance) this.musicInstance.pause();
        })));
        cc.isLoadAllSoundWeb = true;
    },

    setMusicVolume(volume)
    {
        this.musicVolume = volume;
        if (!this.isEnableBGM) return;

        if (!this.webSound) // audioEngine
        {
            cc.audioEngine.setMusicVolume(volume);
        }
        else { // web sound ---
            if (this.musicInstance) this.musicInstance.volume(volume);
        }
    },

    setEffectsVolume(volume)
    {
        this.effectVolume = volume;
        if (!this.webSound) // audioEngine
        {
            cc.audioEngine.setEffectsVolume(volume);
        }
        else { // web sound ---
            for (var i in this.howlMap) {
                let instance = this.howlMap[i];
                if (instance != this.musicInstance) instance.volume(volume);
            }
        }
    },

    playMusic(audio, loop = true, volume = this.musicVolume, offset = 0)
    {
        if (volume < 0) volume = this.musicVolume;
        try {
            this._playMusic(audio, loop, volume, offset);
        }
        catch(e)
        {
            cc.log(e.toString());
        }
    },

    _playMusic(audio, loop = true, volume = this.musicVolume, offset = 0)
    {
        if(!audio || (!audio.name && !this.howlMap[audio._uuid]))
        {
            cc.log("WebSoundPlayer::playMusic invalid audio", audio);
            return;
        }
        cc.log("playMusic ==== " + audio._uuid + ' volume ' + volume);

        //this.node.getChildByName('debugTf').getComponent('cc.Label').string = this.isEnableBGM;
        this.currentBGM = audio;
        this.musicVolume = volume;
        this.musicOffset = offset;
        if (!this.webSound)
        {
            this.ccMusic = cc.audioEngine.playMusic(audio, loop);
            if (!cc.sys.isBrowser) // fix native sync issue
            {
                if (!this.isEnableBGM) cc.audioEngine.setMusicVolume(0.001);
                else cc.audioEngine.setMusicVolume(volume);
            }
            else {
                cc.audioEngine.setMusicVolume(volume);
                if (!this.isEnableBGM) cc.audioEngine.pauseMusic();
            }
            if (offset > 0) cc.audioEngine.setCurrentTime(this.ccMusic, offset);
        }
        else { // websound
            if (this.isAllWebSoundLoaded)
            {
                if (this.musicInstance) this.musicInstance.stop();
                this.musicInstance = this.howlMap[audio._uuid];
                this.bgMusicUUID = audio._uuid;
                this.musicInstance.loop(loop);
                this.musicInstance.volume(volume);
                this.bgMusicId = this.musicInstance.play();
                if (!this.isEnableBGM || !this.isGameActive) this.pauseMusic();
                if (offset > 0) this.musicInstance.seek(offset);
            }
        }
    },

    stopMusic()
    {
        try {
            this._stopMusic();
        }
        catch(e)
        {
            cc.log(e.toString());
        }
    },

    _stopMusic()
    {
        this.currentBGM = null;
        this.ccMusic = -1;
        if (!this.webSound)
        {
            cc.audioEngine.stopMusic();
            return;
        }

        // web sound ---
        if (this.musicInstance)
        {
            this.musicInstance.stop();
            this.bgMusicId = -1;
        }
    },

    pauseMusic()
    {
        try {
            this._pauseMusic();
        }
        catch(e)
        {
            cc.log(e.toString());
        }
    },

    _pauseMusic()
    {
        if (!this.webSound)
        {
            cc.audioEngine.pauseMusic();
            return;
        }

        // web sound ---
        if (this.musicInstance)
        {
            if (cc.sys.os == cc.sys.OS_IOS) this.musicInstance.volume(0.001);
            else this.musicInstance.pause();
        }
    },

    resumeMusic()
    {
        try {
            this._resumeMusic();
        }
        catch(e)
        {
            cc.log(e.toString());
        }
    },

    _resumeMusic()
    {
        if (!this.isEnableBGM) return;
        if (!this.webSound) // audioEngine
        {
            cc.audioEngine.resumeMusic();
            cc.audioEngine.setMusicVolume(this.musicVolume);
        }
        else { // web sound ---
            if (!this.musicInstance || !this.currentBGM) return;
            let offset = 0;
            offset = this.musicInstance.seek();
            this.musicInstance.stop(this.bgMusicId);
            this.musicInstance = this.howlMap[this.currentBGM._uuid];
            this.bgMusicId = this.playHowl(this.musicInstance, {loop: true, volume: this.MUSIC_VOLUME, offset: offset});
        }
    },

    fadeMusicTo(time, endVolume) {
        if (!this.currentBGM) return;

        const volume = { value: this.musicVolume };
        const tweenFade = cc.tween(volume)
            .to(time, { value: endVolume }, {
                progress: (start, end, current, ratio) => {
                    const currentVolume = Math.round(current * 100) / 100;
                    this.setMusicVolume(currentVolume);
                    return start + (end - start) * ratio;
                }
            })
            .start();

        return tweenFade;
    },

    fadeEffectTo(soundId, time, endVolume) {
        if (soundId === null || soundId === undefined) return null;

        const volume = { value: this.getVolume(soundId) };
        const tweenFade = cc.tween(volume)
            .to(time, { value: endVolume }, {
                progress: (start, end, current, ratio) => {
                    const currentVolume = Math.round(current * 100) / 100;
                    this.setVolume(soundId, currentVolume);
                    return start + (end - start) * ratio;
                }
            })
            .start();

        return tweenFade;
    },

    stopEffect(id)
    {
        try {
            this._stopEffect(id);
        }
        catch(e)
        {
            cc.log(e.toString());
        }
    },

    _stopEffect(id)
    {
        if (!this.webSound) // audioEngine
        {
            if (id !== undefined && id !== null) {
                cc.audioEngine.stopEffect(id);
            }
        }
        else { // web sound ---
            // need check type more precise
            if (this._hasAudioContext) {
                if ((typeof id != 'number') && id) id.stop();
            } else {
                this._sfxCacheGesture.forEach((soundObject, index) => {
                    if (soundObject.sound == id) {
                        this._sfxCacheGesture.splice(index, 1);
                    }
                });
            }
        }
    },

    stopAllEffects()
    {
        try {
            this._stopAllEffects();
        }
        catch(e)
        {
            cc.log(e.toString());
        }
    },

    _stopAllEffects()
    {
        if (!this.webSound)
        {
            // let offset = 0, isLoop = false, musicVolume = 1;
            // if (this.ccMusic >= 0)
            // {
            //     offset = cc.audioEngine.getCurrentTime(this.ccMusic);
            //     isLoop = cc.audioEngine.isLoop(this.ccMusic);
            //     musicVolume = cc.audioEngine.getVolume(this.ccMusic);
            // }
            // cc.audioEngine.stopAllEffects();
            // // for fixing sound native issue
            // if (this.ccMusic >= 0 && this.currentBGM && !cc.sys.isBrowser)
            // {
            //     let volume = this.isEnableBGM ? this.musicVolume : 0;
            //     this.ccMusic = cc.audioEngine.playMusic(this.currentBGM, isLoop);
            //     cc.audioEngine.setMusicVolume(volume);
            //     cc.audioEngine.setCurrentTime(this.ccMusic, offset);
            // }

            for(let i = 0; i<this.playingSounds.length; i++){
                const soundId = this.playingSounds[i];
                if(soundId){
                    // this._stopEffect(soundId);
                    const state = cc.audioEngine.getState(soundId);
                    if(state == cc.audioEngine.AudioState.PLAYING){
                        this._stopEffect(soundId);
                    }
                }
            }
            this.playingSounds = [];
        }
        else { // web sound ---
            for (var i in this.howlMap) {
                let howl = this.howlMap[i];
                if (howl != this.musicInstance) howl.stop();
            }
            this._sfxCacheGesture = [];
        }
    },

    pauseEffect(soundId){ 
        try {
            this._pauseEffect(soundId);
        } catch (e) {
            cc.log(e.toString());
        }
    },

    _pauseEffect(soundId){
        if (!this.webSound) {
            cc.audioEngine.pauseEffect(soundId);
            return;
        }

        if (soundId) {
            soundId.pause();
        }
    },
    
    resumeEffect(soundId){
        try {
            this._resumeEffect(soundId);
        } catch (e) {
            cc.log(e.toString());
        }
    },

    _resumeEffect(soundId){
        if (!this.webSound) {
            cc.audioEngine.resumeEffect(soundId);
            return;
        }

        if (soundId) {
            soundId.play();
        }
    },

    playSFXClick()
    {
        if(!this.sfxClick || (!this.sfxClick.name && !this.howlMap[this.sfxClick._uuid]))
        {
            cc.log("WebSoundPlayer::playSFXClick invalid sfxClick");
            return;
        }
        if (!this.isEnableSFX || !this.sfxClick) return;
        let id;
        if (!this.webSound)
        {
            id = cc.audioEngine.playEffect(this.sfxClick);
            const length = this.playingSounds.length;
            if(length >9){
                this.playingSounds.splice(0, length-5);
            }
            this.playingSounds.push(id);
        }
        else { // web sound ---
            id = this.howlMap[this.sfxClick._uuid];
            id.play();
        }
        return id;
    },

    playEffect(sfx, loop = false, volume = this.effectVolume)
    {
        let id = null;
        try {
            id = this._playEffect(sfx, loop, volume);
        }
        catch(e)
        {
            cc.log(e.toString());
        }
        return id;
    },

    _playEffect(sfx, loop = false, volume = this.effectVolume)
    {
        if (!this.isGameActive) return;
        if(!sfx || (!sfx.name && !this.howlMap[sfx._uuid]))
        {
            cc.log("WebSoundPlayer::playEffect invalid sfx");
            return;
        }

        if (!this.isEnableSFX) return;
        let id = null;
        if (!this.webSound)
        {
            id = cc.audioEngine.playEffect(sfx, loop);
            const length = this.playingSounds.length;
            if(length >9){
                this.playingSounds.splice(0, length-5);
            }
            this.playingSounds.push(id);
        }
        else { // web sound ---
            if (this.isAllWebSoundLoaded)
            {
                id = this.howlMap[sfx._uuid];
                if (this._hasAudioContext) {
                    id.loop(loop);
                    id.volume(volume);
                    id.play();
                } else {
                    this._sfxCacheGesture.push({ sound: id, startTime: this._timer, duration: id._duration, loop, volume });
                }
            }
        }
        return id;
    },

    playSFX(sfx)
    {
        return this.playEffect(sfx);
    },

    playSound(audio, loop = false, volume = this.SOUND_EFFECT_VOLUME)
    {
        let id = null;
        try {
            id = this._playSound(audio, loop, volume);
        }
        catch(e)
        {
            cc.log(e.toString());
        }
        return id;
    },

    _playSound(audio, loop = false, volume = this.SOUND_EFFECT_VOLUME)
    {
        if (!this.isGameActive) return;
        if(!audio || (!audio.name && !this.howlMap[audio._uuid]))
        {
            cc.log("WebSoundPlayer::playSound invalid audio");
            return;
        }

        if (!this.isEnableSFX) return null;
        let id = null;
        if (!this.webSound)
        {
            id = cc.audioEngine.play(audio, loop, volume);
            const length = this.playingSounds.length;
            if(length >9){
                this.playingSounds.splice(0, length-5);
            }
            this.playingSounds.push(id);
        }
        else { // web sound ---
            if (this.isAllWebSoundLoaded)
            {
                id = this.howlMap[audio._uuid];
                if (this._hasAudioContext) {
                    id.loop(loop);
                    id.volume(volume);
                    id.play();
                } else {
                    this._sfxCacheGesture.push({ sound: id, startTime: this._timer, duration: id._duration, loop, volume });
                }
            }
        }
        return id;
    },

    stopSound(id)
    {
        try {
            this._stopSound(id);
        }
        catch(e)
        {
            cc.log(e.toString());
        }
    },

    _stopSound(id)
    {
        this.stopEffect(id);
    },

    stopAllAudio()
    {
        try {
            this._stopAllAudio();
        }
        catch(e)
        {
            cc.log(e.toString());
        }
    },

    _stopAllAudio()
    {
        this.currentBGM = null;
        this.ccMusic = -1;
        if (!this.webSound)
        {
            cc.audioEngine.stopAll();
        }
        else {// web sound ---
            this.stopAllEffects();
            if (this.musicInstance) this.musicInstance.pause();
        }
    },

    sfxToggle()
    {
        this.setEffectEnable(!this.isEnableSFX);
    },

    setEffectEnable(enable)
    {
        this.isEnableSFX = enable;
        if (this.node.gSlotDataStore) this.node.gSlotDataStore.isEnableSFX = this.isEnableSFX;
        if (this.isWebSoundClient2) {
            cc.sys.localStorage.setItem(this.storageKeySFX, this.isEnableSFX ? "1" : "0");
        } else {
            cc.sys.localStorage.setItem(this.storageKeySFX, this.isEnableSFX);
        }

        if (!this.isEnableSFX)
        {
            this.stopAllEffects();
        }
    },

    bgmToggle()
    {
        this.setBgmEnable(!this.isEnableBGM);
    },

    setBgmEnable(enable)
    {
        this.isEnableBGM = enable;
        if (this.node.gSlotDataStore) this.node.gSlotDataStore.isEnableBGM = this.isEnableBGM;

        if (this.isWebSoundClient2) {
            cc.sys.localStorage.setItem(this.storageKeyBGM, this.isEnableBGM ? "1" : "0");
        } else {
            cc.sys.localStorage.setItem(this.storageKeyBGM, this.isEnableBGM);
        }

        if(this.enableMusicFunc){
            clearTimeout(this.enableMusicFunc);
        }
        this.enableMusicFunc = setTimeout(()=>{
            if (this.isEnableBGM)
            {
                if (!this.currentBGM) this.playMainBGM();
                else this.resumeMusic();
            } else {
                this.pauseMusic();
            }
            this.enableMusicFunc = null;
        }, 100);
    },

    setVolume(id, volume = 1.0)
    {
        if (id !== 0 && !id) return false;
        if (!this.webSound) // audioEngine
        {
            cc.audioEngine.setVolume(id, volume);
        }
        else { // web sound ---       
            // need check type more precise
            if (typeof id != 'number') id.volume(volume);
        }
        return true;
    },

    getVolume(id)
    {
        if (id !== 0 && !id) return 0;
        if (!this.webSound) // audioEngine
        {
            return cc.audioEngine.getVolume(id);
        }
        else { // web sound ---       
            // need check type more precise
            if (typeof id != 'number') return id.volume();
        }
    },

    getPlayState(id)
    {
        if (id !== 0 && !id) return SoundStateEnum.NONE;
        let state = SoundStateEnum.NONE;
        if (!this.webSound) // audioEngine
        {
            switch(cc.audioEngine.getState(id))
            {
                case cc.audioEngine.AudioState.PLAYING:
                    state = SoundStateEnum.PLAYING;
                    break;
            }
        }
        else { // web sound ---       
            // need check type more precise
            if (typeof id != 'number')
            {
                if (id.playing()) state = SoundStateEnum.PLAYING;
            }
        }
        return state;
    },

    getMusicState()
    {
        let id = this.webSound? this.musicInstance : this.ccMusic;
        return this.getPlayState(id);
    },

    // return in seconds
    getDuration(id)
    {
        if (id === null || id === undefined) return 0;
        if (!this.webSound) // audioEngine
        {
            return cc.audioEngine.getDuration(id);
        }
        else { // web sound ---       
            // need check type more precise
            if (typeof id != 'number') return id.duration();
        }
    },

    // update (dt) {},

    onDestroy()
    {
        if (this.gameNode) this.gameNode.off(cc.Node.EventType.TOUCH_END, this.startPlayWithUserGesture, this, true);
        cc.game.off(cc.game.EVENT_SHOW, this.onGameShow, this);
        cc.game.off(cc.game.EVENT_HIDE, this.onGameHide, this);
        if (this.webSound)
        {
            for (let i in this.howlMap)
            {
                if (this.howlMap[i] != this.musicInstance || !this.keepAudioSession) this.howlMap[i].unload();
            }

            if (this.keepAudioSession)
            {
                if(this.musicInstance)
                {
                    this.musicInstance.volume(0.001);
                    window['_v_audio_backgroud_session'] =
                        {
                            uuid: this.bgMusicUUID,
                            bgMusicId: this.bgMusicId,
                            instance: this.musicInstance
                        };
                }
            }
            else window['_v_audio_backgroud_session'] = null;
        }
        this.playingSounds = [];
        clearTimeout(this.enableMusicFunc);
    },
});

module.exports = {
    SoundStateEnum,
    SoundStorageKeys,
    WebSoundPlayer
};
