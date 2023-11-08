const TweenView = require('TweenView');
const { checkConditionCloseGameIframe } = require("gameCommonUtils");
cc.Class({
    extends: TweenView,

    properties: {
        exitGameNode: cc.Node,

        btnSoundOn: cc.Node,
        btnSoundOff: cc.Node,

        btnMusicOn: cc.Node,
        btnMusicOff: cc.Node,

        overlay: cc.Node,

        borderOverlayList: [cc.Node],
    },

    onLoad() {
        this._super();
        this.node.init = this.init.bind(this);
        this.node.clickPlayTrial = this.clickPlayTrial.bind(this);
        this.node.clickPlayReal = this.clickPlayReal.bind(this);

        this.checkGameInApp();
    },

    show(onStartCB = null, onCompleteCB = null) {
        if (this.overlay != null) this.overlay.active = true;
        this._super(onStartCB, () => {
            this.activeBorderOverlayList(true);
            this.scheduleOnce(()=>{
                onCompleteCB && onCompleteCB();
            }, 0.5);
            const { isAutoSpin } = this.node.gSlotDataStore;
            const { isFinished } = this.node.gSlotDataStore.playSession;
            if (this.overlay != null) {
                this.overlay.active = (isAutoSpin || (isFinished === false));
            }
        });
    },

    hide(onStartCB = null, onCompleteCB = null) {
        let completeCallBack = () => {
            onCompleteCB && onCompleteCB();
            this.activeBorderOverlayList(false);
        };
        this._super(onStartCB, completeCallBack);
        if (this.overlay != null) this.overlay.active = false;
    },

    checkGameInApp() {
        if (this.exitGameNode) {
            const isEnableBtn = checkConditionCloseGameIframe();

            if (isEnableBtn) {
                this.exitGameNode.getComponent(cc.Button).interactable = true;
            } else {
                this.exitGameNode.getComponent(cc.Button).interactable = false;
            }
        }
    },

    onExitGame() {
        this.node.soundPlayer && this.node.soundPlayer.playSFXClick();

        if (cc.sys.isNative && typeof (closeCreatorGame) === 'function') {
            if (this.exitGameNode) {
                this.exitGameNode.emit("BACK_TO_LOBBY");
            }
        } else {
            this.scheduleOnce(() => {
                if (this.exitGameNode) {
                    this.exitGameNode.emit("BACK_TO_LOBBY");
                }
            }, 0.5);
        }
    },

    init() {
        // sound setting
        if (this.node.soundPlayer) {
            this.btnSoundOn.active = this.node.soundPlayer.isEnableSFX;
            this.btnSoundOff.active = !this.node.soundPlayer.isEnableSFX;

            this.btnMusicOn.active = this.node.soundPlayer.isEnableBGM;
            this.btnMusicOff.active = !this.node.soundPlayer.isEnableBGM;
        }

    },

    clickSoundOn() {
        // turn off sound
        if (this.btnSoundOff) this.btnSoundOff.active = true;
        if (this.btnSoundOn) this.btnSoundOn.active = false;
        if (!this.node.soundPlayer) {
            cc.warn('[SOUND_EVENT] No sound player found');
            return;
        }

        this.node.soundPlayer.setEffectEnable(false);
    },

    clickSoundOff() {
        // turn on sound
        if (this.btnSoundOff) this.btnSoundOff.active = false;
        if (this.btnSoundOn) this.btnSoundOn.active = true;
        if (!this.node.soundPlayer) {
            cc.warn('[SOUND_EVENT] No sound player found');
            return;
        }
        this.node.soundPlayer.setEffectEnable(true);
        this.node.soundPlayer.playSFXClick();
    },

    clickMusicOn() {
        // turn off sound
        if (this.btnMusicOff) this.btnMusicOff.active = true;
        if (this.btnMusicOn) this.btnMusicOn.active = false;
        if (!this.node.soundPlayer) {
            cc.warn('[SOUND_EVENT] No sound player found');
            return;
        }
        this.node.soundPlayer.stopMainBGM();
        this.node.soundPlayer.playSFXClick();
    },

    clickMusicOff() {
        // turn on sound
        if (this.btnMusicOff) this.btnMusicOff.active = false;
        if (this.btnMusicOn) this.btnMusicOn.active = true;
        if (!this.node.soundPlayer) {
            cc.warn('[SOUND_EVENT] No sound player found');
            return;
        }
        this.node.soundPlayer.setBgmEnable(true);
        this.node.soundPlayer.playSFXClick();
    },

    clickPlayTrial() {

    },

    clickPlayReal() {
        
    },

    activeBorderOverlayList(isActive) {
        for (let i = 0; i < this.borderOverlayList.length; i++) {
            let borderNode = this.borderOverlayList[i];
            borderNode.active = isActive;
        }
    }
});
