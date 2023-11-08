

cc.Class({
    extends: require("SlotButtonBase"),

    properties: {
        stopAutoSpinBtn: cc.Node,
        spinBtn: cc.Node,
        fastToResultBtn: cc.Node,
        panelMultiSpin: cc.Node,
        multiSpin1Btn: cc.Node,
        multiSpin2Btn: cc.Node,
        multiSpin3Btn: cc.Node,
        multiSpin4Btn: cc.Node,
        removeSpinPanel: false,
        promotionSpin: cc.Node,
        promotionSpinTimes: cc.Node,
        promotionSpinStopBtn: cc.Node,
        promotionSpinEffect: cc.Node,
        promotionIconSpin: cc.Node,
        removeSoundClick: false
    },
    onLoad() {
        if (this.spinBtn) {
            this.node.on("SPIN_ENABLE",this.enableSpin,this);
            this.node.on("SPIN_DISABLE",this.disableSpin,this);
            this.node.on("SPIN_SHOW",this.showSpin,this);
            this.node.on("SPIN_HIDE",this.hideSpin,this);
        }
        
        if (this.fastToResultBtn) {
            this.node.on("FAST_TO_RESULT_SHOW",this.showFastToResult,this);
            this.node.on("FAST_TO_RESULT_HIDE",this.hideFastToResult,this);
            this.node.on("FAST_TO_RESULT_ENABLE",this.enableFastToResult,this);
            this.node.on("FAST_TO_RESULT_DISABLE",this.disableFastToResult,this);
        }
        
        if (this.stopAutoSpinBtn) {
            this.node.on("STOP_AUTO_SPIN_SHOW",this.showStopAutoSpin,this);
            this.node.on("STOP_AUTO_SPIN_HIDE",this.hideStopAutoSpin.bind(this));
        }

        this.node.on("PAUSE_AUTO_SPIN", this.pauseAutoSpin,this);

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        this.node.on("ENABLE_SPIN_KEY", (enable)=>{
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
            
            if (enable)
                cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        });

        if(this.promotionSpin){
            this.node.on("PROMOTION_SPIN_SHOW",this.showPromotionSpin,this);
            this.node.on("PROMOTION_SPIN_HIDE",this.hidePromotionSpin,this);
        }

        if(this.promotionSpinEffect){
            this.node.on("SHOW_PROMOTION_SPIN_EFFECT",this.showPromotionSpinEffect,this);
            this.node.on("HIDE_PROMOTION_SPIN_EFFECT",this.hidePromotionSpinEffect,this);
        }

        if(this.promotionSpinTimes){
            this.node.on("PROMOTION_SPIN_TIMES_SHOW",this.showPromotionSpinTimes,this);
            this.node.on("PROMOTION_SPIN_TIMES_HIDE",this.hidePromotionSpinTimes,this);
        }

        if(this.promotionSpinStopBtn){
            this.node.on("PROMOTION_STOP_SPIN_SHOW",this.showPromotionSpinStopBtn,this);
            this.node.on("PROMOTION_STOP_SPIN_HIDE",this.hidePromotionSpinStopBtn,this);
            this.node.on("DISABLE_PROMOTION_STOP_SPIN", this.disablePromotionSpinStopBtn, this);
            this.node.on("ENABLE_PROMOTION_STOP_SPIN", this.enablePromotionSpinStopBtn, this);
        }

        this.node.on("HIDE_ALL_PROMOTION_BUTTONS",this.hideAllPromotionButton,this);
        this.node.on("SHOW_ALL_PROMOTION_BUTTONS",this.showAllPromotionButton,this);

        this._isPromotionSpin = false;

        if(this.promotionSpin){
            this.promotionSpin.zIndex = 7;
        }

        if(this.promotionSpinStopBtn){
            this.promotionSpinStopBtn.zIndex = 8;
        }

        if(this.promotionIconSpin){
            this.promotionIconSpin.zIndex = 10;
        }

        if(this.promotionSpinTimes){
            this.promotionSpinTimes.zIndex = 11;
        }

        if (this.spinBtn) {
            this.spinBtnComponent = this.spinBtn.getComponent(cc.Button);
            this.spinBtnComponent.interactable = false;
        }

    },
    start() {
        if (this.spinBtn && this.panelMultiSpin && this.stopAutoSpinBtn) {
            this.hideAutoSpinPanel();
            this.bindAutoSpinEvent();
            this.panelMultiSpin.zIndex = 4;
            this.stopAutoSpinBtn.zIndex = 3;
        }
        if (this.spinBtn) {
            this.spinBtn.zIndex = 1;
        }
        if (this.fastToResultBtn) {
            this.fastToResultBtn.zIndex = 2;
        }
    },

    bindAutoSpinEvent() {
        if(this.spinBtn){
            this.spinBtn.on(cc.Node.EventType.TOUCH_START, () => {
                this.selectionAutoSpin = false;
                this.showFunc = setTimeout(() => {
                    if (this.canAutoSpin()) {
                        this.selectionAutoSpin = true;
                        if (this.node.soundPlayer) {
                            this.node.soundPlayer.playSFXClick();
                        }
                        if (!this.removeSpinPanel)
                            this.showAutoSpinPanel();
                        else
                            this.node.emit('MULTI_SPIN_4_CLICK');
                    }
                }, 700);
                this.node.emit('ON_TOUCH_START');
                this._isTouched = true;
            });
            this.spinBtn.on(cc.Node.EventType.TOUCH_END, this.onTouchCancel.bind(this));
            this.spinBtn.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel.bind(this));
            this.spinBtn.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove.bind(this));
            this.spinBtn.on(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave.bind(this));
        }
    },

    unbindAutoSpinEvent() {
        if(this.spinBtn){
            this.spinBtn.off(cc.Node.EventType.TOUCH_START);
            this.spinBtn.off(cc.Node.EventType.TOUCH_END);
            this.spinBtn.off(cc.Node.EventType.TOUCH_CANCEL);
            this.spinBtn.off(cc.Node.EventType.TOUCH_MOVE);
            this.spinBtn.off(cc.Node.EventType.MOUSE_LEAVE);
        }
    },

    hideAutoSpinPanel(){
        this.panelMultiSpin.active = false;
    },

    showAutoSpinPanel(){
        this.panelMultiSpin.active = true;
    },

    cancelAutoSpinPanel()
    {
        if (this.selectionAutoSpin) return;
        if (this.showFunc) {
            this.panelMultiSpin.active = false;
            clearTimeout(this.showFunc);
        }
    },

    onMouseLeave(){
        if(this.selectionAutoSpin===false){
            this.cancelAutoSpinPanel();
        }
    },

    onTouchMove(event){
        let touch  = event.touch;
        let hit = this.spinBtn._hitTest(touch.getLocation());
        if(hit){
            if(!this._isTouched){
                this.node.emit('ON_TOUCH_START');
                this._isTouched = true;
            }
        }else{
            this.cancelAutoSpinPanel();
            if (this.selectionAutoSpin) return;
            this.node.emit('ON_TOUCH_CANCEL');
            this._isTouched = false;
        }
    },

    onTouchCancel(){
        this.cancelAutoSpinPanel();
        if (this.selectionAutoSpin) return;
        this.node.emit('ON_TOUCH_CANCEL');
        this._isTouched = false;
    },

    //Spin button
    showSpin() {
        this.spinBtn.active = true;
        this.spinBtn.opacity = this._isPromotionSpin == true ? 0: 255;
    },
    hideSpin() {
        this.cancelAutoSpinPanel();
        this.spinBtn.active = false;
    },
    enableSpin() {
        this.spinBtnComponent.interactable = true;
    },
    disableSpin() {
        //this is cheat to turn off panelMultiSpin after click other func
        if (this.panelMultiSpin) {
            this.panelMultiSpin.active = false;
        }
        this.spinBtnComponent.interactable = false;
    },
    spinClick(){
        if (this.node.soundPlayer && !this.removeSoundClick) {
            this.node.soundPlayer.playSFXClick();
        }
        if (this.panelMultiSpin.active) return;
        this.node.emit('SPIN_CLICK');
    },

    //Fast to result
    showFastToResult() {
        this.fastToResultBtn.active = true;
    },
    hideFastToResult() {
        this.fastToResultBtn.active = false;
    },
    enableFastToResult() {
        this.fastToResultBtn.getComponent(cc.Button).interactable = true;
    },
    disableFastToResult() {
        this.fastToResultBtn.getComponent(cc.Button).interactable = false;
    },
    fastToResultClick(){
        if (this.node.soundPlayer && !this.removeSoundClick) {
            this.node.soundPlayer.playSFXClick();
        }
        this.node.emit('FAST_TO_RESULT_CLICK');
    },

    //Stop Auto Spin
    showStopAutoSpin() {
        if (this.stopAutoSpinBtn) {
            this.stopAutoSpinBtn.active = true;
        }
    },
    hideStopAutoSpin(isResume) {
        if (this.stopAutoSpinBtn) {
            this.stopAutoSpinBtn.active = false;
        }
        if (this.fastToResultBtn && !this.fastToResultBtn.active && this.selectionAutoSpin && !isResume) {
            this.fastToResultBtn.active = true;
        }
    },
    stopAutoSpinClick() {
        if (this.node.soundPlayer && !this.removeSoundClick) {
            this.node.soundPlayer.playSFXClick();
        }
        this.node.emit('STOP_AUTO_SPIN_CLICK');
    },


    multiSpin1Click() {
        this.panelMultiSpin.active = false;
        if (this.node.soundPlayer && !this.removeSoundClick) {
            this.node.soundPlayer.playSFXClick();
        }
        this.node.emit('MULTI_SPIN_1_CLICK');
    },
    multiSpin2Click() {
        this.panelMultiSpin.active = false;
        if (this.node.soundPlayer && !this.removeSoundClick) {
            this.node.soundPlayer.playSFXClick();
        }
        this.node.emit('MULTI_SPIN_2_CLICK');
    },
    multiSpin3Click() {
        this.panelMultiSpin.active = false;
        if (this.node.soundPlayer && !this.removeSoundClick) {
            this.node.soundPlayer.playSFXClick();
        }
        this.node.emit('MULTI_SPIN_3_CLICK');
    },
    multiSpin4Click() {
        this.panelMultiSpin.active = false;
        if (this.node.soundPlayer && !this.removeSoundClick) {
            this.node.soundPlayer.playSFXClick();
        }
        this.node.emit('MULTI_SPIN_4_CLICK');
    },

    onKeyUp(event)
    {
        if (event.keyCode == cc.macro.KEY.space)
        {
            if (this.spinBtnComponent && this.spinBtnComponent.interactable && !this.stopAutoSpinBtn.active)
                this.node.emit('SPACE_PRESSED');

            else if (this.fastToResultBtn && this.fastToResultBtn.active)
            {
                if (this.fastToResultBtn.getComponent(cc.Button).interactable)
                    this.node.emit('FAST_TO_RESULT_CLICK');
            }
        }
    },

    pauseAutoSpin(isPause = false) {
        this.isPauseAutoSpin = isPause;
    },

    canAutoSpin() {
        if(this.node){
            this.node.emit('CHECK_AUTO_SPIN_FLAG', 'pauseAutoSpin');
        }
        return !this.isPauseAutoSpin && this.spinBtnComponent.interactable;
    },

    showPromotionSpin(){
        this.promotionSpin.active = true;
        this.showPromotionIconSpin();
        this.enableIconSpin();
    },

    hidePromotionSpin() {
        this.promotionSpin.active = false;
        this.hidePromotionIconSpin();
        this.disableIconSpin();
    },

    enableIconSpin() {
        
    },

    disableIconSpin() {
        
    },

    hidePromotionIconSpin() {
        if(this.promotionIconSpin){
            this.promotionIconSpin.active = false;
        }
    },

    showPromotionIconSpin() {
        if(this.promotionIconSpin){
            this.promotionIconSpin.active = true;
        }
    },

    showPromotionSpinEffect(delay = 0) {
        if (this.promotionSpinEffect) {
            this.promotionSpinEffect.active = true;
            this.promotionEffect = cc.sequence(
                cc.delayTime(delay),
                cc.callFunc(() => {
                    this.promotionSpinEffect.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
                    this.promotionSpinEffect.opacity = 255;
                })
            );
            this.promotionSpinEffect.runAction(this.promotionEffect);
        }
    },

    hidePromotionSpinEffect() {
        if (this.promotionSpinEffect) {
            if (this.promotionEffect) {
                this.promotionSpinEffect.stopAction(this.promotionEffect);
            }
            this.promotionSpinEffect.opacity = 0;
            this.promotionSpinEffect.active = false;
        }
    },

    showPromotionSpinTimes() {
        if(this.promotionSpinTimes){
            this.promotionSpinTimes.active = true;
        }
    },

    hidePromotionSpinTimes() {
        if(this.promotionSpinTimes){
            this.promotionSpinTimes.active = false;
        }
    },

    showPromotionSpinStopBtn() {
        if(this.promotionSpinStopBtn){
            this.promotionSpinStopBtn.active = true;
        }
    },

    hidePromotionSpinStopBtn() {
        if(this.promotionSpinStopBtn){
            this.promotionSpinStopBtn.active = false;
        }
    },

    disablePromotionSpinStopBtn() {
        if (this.promotionSpinStopBtn) {
            this.promotionSpinStopBtn.getComponent(cc.Button).interactable = false;
        }
    },

    enablePromotionSpinStopBtn() {
        if (this.promotionSpinStopBtn) {
            this.promotionSpinStopBtn.getComponent(cc.Button).interactable = true;
        }
    },

    showButtonsEndPromotion() {
        if (!this.spinBtn || !this.fastToResultBtn || !this.stopAutoSpinBtn) return;
        this._isPromotionSpin = false;
        this.spinBtn.opacity = 255;
        this.fastToResultBtn.opacity = 255;
        this.stopAutoSpinBtn.opacity = 255;
        this.hidePromotionSpinEffect();
    },

    hideButtonStartPromotion() {
        if (!this.spinBtn || !this.fastToResultBtn || !this.stopAutoSpinBtn) return;
        this._isPromotionSpin = true;
        this.spinBtn.opacity = 0;
        this.fastToResultBtn.opacity = 0;
        this.stopAutoSpinBtn.opacity = 0;
        this.showPromotionSpinEffect();
    },

    hideAllPromotionButton() {
        this.hidePromotionSpin();
        this.hidePromotionSpinStopBtn();
        this.hidePromotionSpinTimes();
        this.bindAutoSpinEvent();
        this.showButtonsEndPromotion();
        this.hidePromotionIconSpin();
    },

    showAllPromotionButton() {
        this.showPromotionSpin();
        this.unbindAutoSpinEvent();
        this.showPromotionSpinTimes();
        this.hideButtonStartPromotion();
    },

    onDestroy() {
        clearTimeout(this.showFunc);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        if(this.promotionSpin){
            this.node.off("PROMOTION_SPIN_SHOW",this.showPromotionSpin,this);
            this.node.off("PROMOTION_SPIN_HIDE",this.hidePromotionSpin,this);
        }

        if(this.promotionSpinEffect){
            this.node.off("SHOW_PROMOTION_SPIN_EFFECT",this.showPromotionSpinEffect,this);
            this.node.off("HIDE_PROMOTION_SPIN_EFFECT",this.hidePromotionSpinEffect,this);
        }

        if(this.promotionSpinTimes){
            this.node.off("PROMOTION_SPIN_TIMES_SHOW",this.showPromotionSpinTimes,this);
            this.node.off("PROMOTION_SPIN_TIMES_HIDE",this.hidePromotionSpinTimes,this);
        }

        if(this.promotionSpinStopBtn){
            this.node.off("PROMOTION_STOP_SPIN_SHOW",this.showPromotionSpinStopBtn,this);
            this.node.off("PROMOTION_STOP_SPIN_HIDE",this.hidePromotionSpinStopBtn,this);
        }

        this.node.off("HIDE_ALL_PROMOTION_BUTTONS",this.hideAllPromotionButton,this);
        this.node.off("SHOW_ALL_PROMOTION_BUTTONS",this.showAllPromotionButton,this);

        this.hidePromotionSpinEffect();
    },
});
