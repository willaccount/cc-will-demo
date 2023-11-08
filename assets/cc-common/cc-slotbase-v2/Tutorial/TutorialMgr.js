const lodash = require('lodash');
const XORCipher = require("XOCypher");
const INDICATOR_ANGEL = {
    TOP: 180,
    LEFT: -90,
    RIGHT: 90
};
cc.Class({
    extends: cc.Component,

    properties: {
        dialog: require("TutorialDialog"),
        gradientBot: cc.Node,
        gradientTop: cc.Node,
        tutorialSteps: {
            type: cc.Asset,
            default: null
        },
        indicator: cc.Node,
        tutorialText: {
            type: cc.Asset,
            default: null
        },
        buttonSkip: cc.Node,
        jackpot: cc.Node,
        timeDelayStart: 0,
        isDebug: false,
    },

    onLoad() {
        if (typeof (this.inited) === 'undefined')
            this.inited = false;
        this.finished = true;
        if (!this.inited) {
            this.node.active = false;
        }

        this.listLockedObjects = [];
        this.listLockedObjectData = [];
        this.trialSessionCount = 0;
    },

    start() {
        this.maxDemoTime = this.node.config.MAX_PLAY_DEMO || 10;
    },

    startTutorial() {
        if (this.waitForStart) return;

        if (!this.inited) {
            this.init();
        }
        this.node.active = true;
        this.node.opacity = 255;
        this.endTutorialData = false;
        this._isSpinning = false;
        this.initJackpot();
        this.slotButtons.forEach(sb => {
            sb.node.emit("ENABLE_SPIN_KEY", false);
        });
        this._lockTouch();
        this.waitForStart = true;
        this.node.stopAllActions();
        if (this.mainDirector && this.mainDirector.node) {
            this.mainDirector.node.emit('DISABLE_BUTTON_CONTROL');
            this.mainDirector.currentGameMode.emit('SPIN_DISABLE');
            this.mainDirector.disableBet(true);
        }
        this.node.runAction(cc.sequence(cc.delayTime(this.timeDelayStart), cc.callFunc(() => {
            this.finished = false;
            this.reset();
            this._unlockTouch();
            this.run();
            if (this.mainDirector && this.mainDirector.node) {
                this.mainDirector.currentGameMode.emit('SPIN_ENABLE');
            }
            this.waitForStart = false;
        })));
    },

    init() {
        if (this.tutorialData) {
            const { data: encryptData, isEncrypted } = this.tutorialData;
            if (isEncrypted) {
                const decryptData = XORCipher.decode_tutorial(encryptData);
                this.tutorialData = JSON.parse(decryptData);
                this.mainDirector.gameStateManager._spinTutorialData = this.tutorialData;
            }
        }

        this.canvas = cc.find("Canvas");
        this.inited = true;
        this.flags = [];
        this.unlockAll();
        this.jackpotComponent = this.jackpot.getComponent("Jackpot");
        this.slotButtons = this.mainDirector.getComponentsInChildren("SlotButtonBase");
        this.jackpotComponent.initData();
        this.jackpotReset = false;
    },

    initJackpot() {
        this.jackpot.active = true;
        this.jackpot.opacity = 255;
        let jackpots = Object.keys(this.node.config.DEFAULT_TRIAL_JACKPOT);
        jackpots.forEach(jp => {
            let value = this.node.config.DEFAULT_TRIAL_JACKPOT[jp];
            this.jackpotComponent.callbackJackpotUpdate(jp, value);
        });
    },

    playIndicatorAnim(angle = 0) {
        this.indicator.stopAllActions();
        switch (angle) {
            case INDICATOR_ANGEL.RIGHT:
                this.indicator.runAction(cc.repeatForever(cc.sequence(cc.moveBy(0.5, 50, 0), cc.moveBy(0.5, -50, 0))));
                break;
            case INDICATOR_ANGEL.LEFT:
                this.indicator.runAction(cc.repeatForever(cc.sequence(cc.moveBy(0.5, -50, 0), cc.moveBy(0.5, 50, 0))));
                break;
            case INDICATOR_ANGEL.TOP:
                this.indicator.runAction(cc.repeatForever(cc.sequence(cc.moveBy(0.5, 0, 50), cc.moveBy(0.5, 0, -50))));
                break;
            default:
                this.indicator.runAction(cc.repeatForever(cc.sequence(cc.moveBy(0.5, 0, -50), cc.moveBy(0.5, 0, 50))));
                break;
        }
    },

    reset() {
        this.index = 0;
        this.spinIndex = 0;
        this.showing = true;
        this.pauseGameMode = false;
        this.buttonSkip.active = true;
        this.flags = [];
    },

    _lockAtButton({ objPath }) {
        let obj = cc.find(objPath);
        if (obj) {
            this.doLockObject(obj);
        }
        else {
            cc.warn("TutorialMgr cant find object with path " + objPath);
        }
    },

    _lockAtObjects({ listPath }) {
        if (this.listLockedObjects && this.listLockedObjects.length) {
            this._unlockAllObjects();
        }
        if (listPath && listPath.length) {
            listPath.forEach(objPath => {
                let lockObject = cc.find(objPath);
                const lockObjectPosition = lockObject.parent.convertToWorldSpaceAR(lockObject.position);
                this.listLockedObjects.unshift(lockObject);
                this.listLockedObjectData.unshift({
                    lockObjectActive: lockObject.active,
                    lockObjectColor: lockObject.color,
                    lockObjectParent: lockObject.parent,
                    lockObjectLocalPos: lockObject.position,
                    lockObjectPosition,
                    lockObjectIndex: lockObject.getSiblingIndex(),
                    lockObjetOpacity: lockObject.opacity,
                });
                lockObject.parent = this.node;
                lockObject.setSiblingIndex(this.gradientTop.getSiblingIndex());
                lockObject.position = this.node.convertToNodeSpaceAR(lockObjectPosition);
                lockObject.active = true;
                lockObject.color = cc.Color.WHITE;
                lockObject.opacity = 255;
            });
            this.gradientBot.active = true;
            this.gradientBot.opacity = 0;
            this.gradientBot.runAction(cc.fadeTo(0.1, 160));
        }
    },

    _unlockAllObjects() {
        if (this.listLockedObjects && this.listLockedObjects.length) {
            this.gradientBot.active = false;
            this.listLockedObjects.forEach((lockObject, index) => {
                const lockObjectData = this.listLockedObjectData[index];
                lockObject.parent = lockObjectData.lockObjectParent;
                lockObject.position = lockObjectData.lockObjectLocalPos;
                lockObject.setSiblingIndex(lockObjectData.lockObjectIndex);
                lockObject.active = lockObjectData.lockObjectActive;
                lockObject.color = lockObjectData.lockObjectColor;
                lockObject.opacity = lockObjectData.lockObjetOpacity;
            });
            this.listLockedObjects = [];
            this.listLockedObjectData = [];
        }
    },

    doLockObject(obj) {
        if (this.lockObject) this._unlockButton();
        this.lockObject = obj;
        this.lockObjectActive = obj.active;
        this.lockObjectColor = obj.color;
        this.lockObjectParent = this.lockObject.parent;
        this.lockObjectLocalPos = this.lockObject.position;
        this.lockObjectPosition = this.lockObjectParent.convertToWorldSpaceAR(this.lockObjectLocalPos);
        this.lockObjectIndex = this.lockObject.getSiblingIndex();
        this.lockObjetOpacity = this.lockObject.opacity;

        this.lockObject.parent = this.node;
        this.lockObject.setSiblingIndex(this.gradientTop.getSiblingIndex());
        this.lockObject.position = this.node.convertToNodeSpaceAR(this.lockObjectPosition);
        this.lockObject.active = true;
        this.lockObject.color = cc.Color.WHITE;
        this.lockObject.opacity = 255;

        this.gradientBot.active = true;
        this.gradientBot.opacity = 0;
        this.gradientBot.runAction(cc.fadeTo(0.1, 160));
    },

    _unlockButton() {
        if (this.lockObject) {
            this.gradientBot.active = false;
            this.lockObject.parent = this.lockObjectParent;
            this.lockObject.position = this.lockObjectLocalPos;
            this.lockObject.setSiblingIndex(this.lockObjectIndex);
            this.lockObject.active = this.lockObjectActive;
            this.lockObject.color = this.lockObjectColor;
            this.lockObject.opacity = this.lockObjetOpacity;
            this.lockObject = null;
        }
    },

    _lockAtSymbol({ x, y, path = "SlotTable/Table/Reel_", extendPath }) {
        let reel = cc.find(path + y, this.mainDirector.currentGameMode);
        let symbol = reel.getComponent("SlotReel").getShowSymbol(x);
        let obj = null;

        if (extendPath) {
            obj = cc.find(extendPath, symbol);
        }
        else {
            obj = symbol;
        }
        obj && this.doLockObject(obj);
    },

    _lockTouch(data) {
        this.gradientTop.opacity = data && data.gradient ? 180 : 0;
        this.gradientTop.active = true;
    },

    _unlockTouch() {
        this.gradientTop.active = false;
    },

    _showDialog({ title, content, position, arrow, arrow1, backgroundReverse }) {
        let titleText = this.getText(title);
        let contentText = this.getText(content);
        this.dialog.node.position = position || cc.v2(0, 0);
        this.dialog.show(titleText, contentText, arrow, arrow1);
        this.dialog.node.scale = 0.1;
        this.dialog.node.runAction(cc.sequence(cc.scaleTo(0.2, 1.2), cc.scaleTo(0.1, 0.9), cc.scaleTo(0.1, 1)));
        const bg = this.dialog.node.getChildByName('Bg');
        if (bg) {
            bg.scaleY = backgroundReverse ? -1 : 1;
        }
    },

    _hideDialog() {
        this.dialog.hide();
    },

    _showIndicator({ rotation, position }) {
        this.indicator.active = true;
        this.indicator.angle = rotation;
        this.indicator.position = position;
        this.playIndicatorAnim(rotation);
    },

    _pauseGameMode({ pause }) {
        this.pauseGameMode = pause;
    },

    _hideIndicator() {
        this.indicator.active = false;
        this.indicator.stopAllActions();
    },

    _startFreespin() {
        if (this.mainDirector && this.mainDirector.currentGameMode.name == "FreeGamePrefab") {
            this.mainDirector.currentGameMode.getComponent("SlotGameDirector").runAction('SpinByTimes', 999999);
        }
    },

    _addBoolFlag({ flag }) {
        this.flags.push(flag);
    },

    _removeBoolFlag({ flag }) {
        this.flags = this.flags.filter(it => it != flag);
    },

    _resumeCurrentScript() {
        this.mainDirector && this.mainDirector.currentGameMode.emit('RUN_CONTINUE_SCRIPT');
    },

    _setLockedButtonPos({ x, y }) {
        if (this.lockObject) {
            this.lockObject.x = x;
            this.lockObject.y = y;
        }
    },

    _setJackpotActive({ active }) {
        if (this.jackpot)
            this.jackpot.active = active;
    },

    _activeBet({ active }) {
        if (active)
            this.mainDirector.enableBet(true);
        else
            this.mainDirector.disableBet(true);
    },

    _setBetValue({ value }) {
        this.mainDirector.bet.emit("UPDATE_BET", value);
    },

    _enableButton({ objPath }) {
        let button = cc.find(objPath);
        if (button) {
            button.getComponent(cc.Button).interactable = true;
        }
    },

    _disableButton({ objPath }) {
        let button = cc.find(objPath);
        if (button) {
            button.getComponent(cc.Button).interactable = false;
        }
    },

    _updateJackpot() {
        this.jackpotComponent && this.jackpotComponent.renderJackpotBet();
    },

    _enableTrialButtons() {
        this.mainDirector.trialButton.emit("ENABLE_BUTTONS", true);
    },

    isContainFlag(flag) {
        return this.flags.indexOf(flag) >= 0;
    },

    trigger(action) {
        if (this.waitingTrigger && this.waitingTrigger.some(trigger => trigger === action)) {
            this.index += 1;
            if (this.index < this.tutorialSteps.json.Steps.length)
                this.run();
            else
                this.hideTutorial();
        }
        if (action == "ON_CUTSCENE_CLOSE" && this.jackpotReset) {
            this.runJackpot();
            this.jackpotReset = false;
        }

        if (action === "GAME_RESET_SESSION") {
            this._isSpinning = false;
            if (this.doActionAfterFinishSpin) {
                this._activeBet({ active: true });
                this.endTutorialData = true;
                this.finished = true;
                this.doActionAfterFinishSpin = false;
            }
            if (this.trialSessionCount >= this.maxDemoTime) {
                this.mainDirector.showPopupRedirect();
                this.trialSessionCount = 0;
            }
        }

        if (action === 'NORMAL_GAME_RESTART') {
            this.trialSessionCount += 1;
        }

        if (action === "SPIN_CLICK") {
            this._isSpinning = true;
        }
    },

    run() {
        this.currentStepData = this.tutorialSteps.json.Steps[this.index];
        if (!this.currentStepData) {
            cc.log("something wrong");
        }

        while (this.currentStepData.command != "_waitFor") {
            this.resolve(this.currentStepData);
            this.index += 1;
            if (this.index < this.tutorialSteps.json.Steps.length)
                this.currentStepData = this.tutorialSteps.json.Steps[this.index];
            else
                break;
        }
        if (this.index >= this.tutorialSteps.json.Steps.length) {
            this.hideTutorial();
        }
        else {
            this.waitingTrigger = this.currentStepData.data["trigger"];
            this.isDebug && cc.warn("%c waiting", "color:red;", this.waitingTrigger);
        }
    },

    resolve(stepData) {
        if (this[stepData.command] && typeof (this[stepData.command]) === "function") {
            this.isDebug && cc.warn(stepData.command, JSON.stringify(stepData.data, null, "\t"));
            this[stepData.command](stepData.data);
        }
        else {
            cc.error("Cant find command " + stepData.command);
        }
    },

    isShowing() {
        return this.inited && this.showing;
    },

    onTutorialClick() {
        this.trigger("TUTORIAL_CLICK");
    },

    onTutorialFinish() {
        if (this.finished) return;
        this.finished = true;
        this.doActionAfterFinishSpin = false;
    },

    unlockAll() {
        this._hideDialog();
        this._hideIndicator();
        this._unlockButton();
        this._unlockTouch();
        this._unlockAllObjects();
        this.buttonSkip.active = false;
        this.gradientBot.active = false;
    },

    getText(id) {
        if (this.tutorialText && this.tutorialText.json && this.tutorialText.json[id]) {
            return this.tutorialText.json[id];
        }
        return id;
    },

    setMainGameMgr(director) {
        this.mainDirector = director;
    },

    skipTutorial(evt) {
        if (this.node.soundPlayer) {
            if (evt) this.node.soundPlayer.playSFXClick();
        }
        this.index = this.tutorialSteps.json.Steps.length;
        this.showing = false;

        if (this.isContainFlag("pauseFreeGame")) {
            this._startFreespin();
        }

        if (this._isSpinning) {
            this.doActionAfterFinishSpin = true;
        }
        else {
            this.endTutorialData = true;
            this.finished = true;
            this._activeBet({ active: true });
        }

        if (this.mainDirector && this.mainDirector.node) {
            this.mainDirector.node.emit('ENABLE_BUTTON_CONTROL');
            this.mainDirector.skipTutorialMode();
        }
        this.node.stopAllActions();
        this.hideTutorial();
    },

    hideTutorial() {
        this.unlockAll();
        this.waitingTrigger = [];
        this.showing = false;
        this.slotButtons.forEach(sb => {
            sb.node.emit("ENABLE_SPIN_KEY", true);
        });
        if (this.endTutorialData) this.onTutorialFinish();
        this.mainDirector.node.emit('HIDE_TUTORIAL');
        this.mainDirector.node.emit('ENABLE_BUTTON_CONTROL');
        this.flags = [];
        this._resumeCurrentScript();
    },

    playAnimSwitchToReal() {
        const havingDirector = this.mainDirector && this.mainDirector.node;
        this.jackpot.active = false;
        this._lockTouch();
        this.node.stopAllActions();
        this._activeBet({ active: false });
        this.slotButtons.forEach(sb => {
            sb.node.emit("ENABLE_SPIN_KEY", false);
        });
        if (havingDirector) {
            this.mainDirector.node.emit('DISABLE_BUTTON_CONTROL');
        }
        this.node.runAction(cc.sequence(cc.delayTime(this.timeDelayStart), cc.callFunc(() => {
            this._activeBet({ active: true });
            this.slotButtons.forEach(sb => {
                sb.node.emit("ENABLE_SPIN_KEY", true);
            });
            if (havingDirector) {
                this.mainDirector.node.emit('ENABLE_BUTTON_CONTROL');
            }
            this._unlockTouch();
            this.node.active = false;
        })));
    },

    isFinished() {
        return !this.inited || (this.finished);
    },

    onStateUpdate(data) {
        cc.log(data);
        this.jackpotComponent = this.jackpot.getComponent("Jackpot");
        if (data.trialJpl) {
            if (data.winJackpotAmount || data.jackpot) {
                if (data.trialJplWin && data.trialJplWin.length) {
                    const { trialJpl, trialJplWin } = data;
                    const isTutorialData = data.trialJplWin.length > 1;
                    this.trialJpl = isTutorialData ? data.trialJplWin : this.getLatestJackpot(trialJpl, trialJplWin);
                    this.runJackpot();
                }
                this.trialJpl = data.trialJpl;
                this.jackpotReset = true;
            } else {
                this.trialJpl = data.trialJpl;
                this.runJackpot();
            }
        }
        if (data.isFinishedTutorial) {
            this.endTutorialData = true;
            if (!this.showing)
                this.onTutorialFinish();
        }
    },

    getLatestJackpot(trialJpl, trialJplWin) {
        const jackpotName = trialJplWin[0].split(';')[0];
        return trialJpl.map(item => item.includes(jackpotName) ? trialJplWin[0] : item);
    },

    runJackpot() {
        for (let i = 0; i < this.trialJpl.length; i++) {
            let jackpotData = this.trialJpl[i].split(';');
            let jackpotAmount = Number(jackpotData[1]);
            let jackpotName = jackpotData[0].replace(this.node.config.JP_PREFIX_EVENT, "");
            this.jackpotComponent.callbackJackpotUpdate(jackpotName, jackpotAmount);
        }
    },

    onEnable() {
        this.jackpot.active = true;
    },

    enableSkipBtn(isOn = false) {
        this.buttonSkip.getComponent(cc.Button).interactable = isOn;
    },

    displaySkipBtn(isActive = false) {
        this.buttonSkip.active = isActive;
    },
});
