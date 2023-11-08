

const { convertObjectToArrayKey, findKeyByValue, formatMoney } = require('utils');
cc.Class({
    extends: cc.Component,

    properties: {
        mini: cc.Node,
        minor: cc.Node,
        major: cc.Node,
        grand: cc.Node,
        jackpotIconAnims: {
            default: [],
            type: sp.Skeleton,
            override: true
        },
        jackpotIcons: {
            default: [],
            type: cc.Node,
            override: true
        },
        jackpotParticles: {
            default: [],
            type: cc.Animation,
            override: true
        },
        jackpotMultiply: cc.Node,
        maxMultiply: 6,
    },
    onLoad() {
        this.node.on("CHANGE_JACKPOT", this.renderJackpotBet, this);
        this.node.on("UPDATE_JACKPOT", this.callbackJackpotUpdate, this);
        this.node.on("REGISTER_JACKPOT", this.register, this);
        this.node.on("PAUSE_JACKPOT", this.pauseRenderJP, this);
        this.node.on("RESUME_JACKPOT", this.resumeRenderJP, this);
        this.node.on("UPDATE_VALUE_JACKPOT", this.updateValueJP, this);
        this.node.on("PLAY_JACKPOT_EXPLOSION", this.playJackpotExplosion, this);
        this.node.on("STOP_JACKPOT_EXPLOSION", this.stopJackpotExplosion, this);
        this.node.on("NOTICE_JACKPOT_WIN", this.noticeJackpotWin, this);
        this.indexJp = {
            "GRAND": 0,
            "MAJOR": 1,
            "MINOR": 2,
            "MINI": 3,
        };
    },
    start() {
        this.initData();
    },

    initData() {
        if (!this.inited) {
            this.isPausedJP = false;
            this.initJackpotData = {};
            this.currentJackpotData = {};
            this.jackpotData = {};
            this.currentJackpotLevel = {};
            this.newJackpotLevel = {};
            this.JP_Prefix = this.node.config.JP_PREFIX_EVENT;
            this.JP_Steps = convertObjectToArrayKey(this.node.config.STEPS);
            this.JP_Names = this.node.config.JP_NAMES;
            this.inited = true;
        }
    },

    register(gameId, data, gameStateManager) {
        this.gameId = gameId;
        this.data = data;
        this.initData();
        gameStateManager.networkCallbackJP(
            this.jackpotUpdate.bind(this),
        );
        if (data.jackpot) {
            Object.keys(data.jackpot).map((jpName) => {
                let name = jpName.replace(this.JP_Prefix, '');
                this.callbackJackpotUpdate(name, data.jackpot[jpName]);
                if (data.jackpot[jpName]) {
                    const levelData = data.jackpot[jpName].toString().split('_');
                    this.currentJackpotLevel[name] = levelData.length > 1 ? Number(levelData[1]) : 1;
                    this.currentJackpotData[name] = Number(data.jackpot[jpName]);
                    this.initJackpotData[jpName] = Number(data.jackpot[jpName]);
                }
            });
        }
    },

    jackpotUpdate(data) {
        if (data) {
            Object.keys(data).map((jpName) => {
                let name = jpName.replace(this.JP_Prefix, '');
                this.callbackJackpotUpdate(name, data[jpName]);
            });
        }
    },

    renderJackpotBet() {
        this.renderJackpot(300);
    },

    renderJackpot(time = 3000) {
        if (this.isPausedJP)
            return;
        const { currentBetData, steps } = this.node.gSlotDataStore.slotBetDataStore.data;
        const stepIndex = findKeyByValue(steps, currentBetData).toString();

        // Check & Play anim jackpot multiply
        this.playAnimMultiply(stepIndex, time);

        this.renderJP({
            node: this.grand,
            value: this.jackpotData[stepIndex + this.transformJPName(this.JP_Names[0])],
            time,
            stepIndex
        });

        if (this.JP_Names.length > 1) {
            this.renderJP({
                node: this.mini,
                value: this.jackpotData[stepIndex + this.transformJPName(this.JP_Names[1])],
                time,
                stepIndex
            });
            this.renderJP({
                node: this.minor,
                value: this.jackpotData[stepIndex + this.transformJPName(this.JP_Names[2])],
                time,
                stepIndex
            });
            this.renderJP({
                node: this.major,
                value: this.jackpotData[stepIndex + this.transformJPName(this.JP_Names[3])],
                time,
                stepIndex
            });
        }
    },

    playAnimMultiply(stepIndex, time) {
        if (this.jackpotMultiply) {
            const jpLevel = stepIndex + this.transformJPName(this.JP_Names[0]);
            if (jpLevel && this.newJackpotLevel[jpLevel] && this.newJackpotLevel[jpLevel] > 1 && this.newJackpotLevel[jpLevel] <= this.maxMultiply) {
                const isDiffJPMultiply = this.currentJackpotLevel[jpLevel] && this.newJackpotLevel[jpLevel]
                    && this.currentJackpotLevel[jpLevel] !== this.newJackpotLevel[jpLevel]
                    && this.newJackpotLevel[jpLevel] > 1;

                const isDiffJPValue = this.currentJackpotLevel[jpLevel] && this.newJackpotLevel[jpLevel]
                    && this.currentJackpotLevel[jpLevel] == this.newJackpotLevel[jpLevel]
                    && this.newJackpotLevel[jpLevel] > 1
                    && this.currentJackpotData[jpLevel] && this.jackpotData[jpLevel]
                    && this.currentJackpotData[jpLevel] > this.jackpotData[jpLevel];

                if (isDiffJPMultiply || isDiffJPValue) {
                    this.grand.onUpdateValue(this.jackpotData[jpLevel] / this.newJackpotLevel[jpLevel], time, false);
                    this.currentJackpotLevel = Object.assign({}, this.newJackpotLevel);
                    this.currentJackpotData = Object.assign({}, this.jackpotData);
                }
                this.jackpotMultiply.emit('PLAY_ANIM_MULTIPLY', this.newJackpotLevel[jpLevel], time);
            } else {
                this.stopAnimMultiply();
            }
        }
    },

    stopAnimMultiply() {
        if (this.jackpotMultiply) this.jackpotMultiply.emit('STOP_ANIM_MULTIPLY');
    },

    transformJPName(name) {
        if (name && name.length > 0) {
            return "_" + name;
        }
        return "";
    },
    
    renderJP({ node, value, time = 3000, stepIndex }) {
        if (node) {
            let allowRunDown = (stepIndex != node.stepIndex);
            node.onUpdateValue(value, time, allowRunDown);
            node.stepIndex = stepIndex;
        }
    },
    pauseRenderJP() {
        this.isPausedJP = true;
    },
    resumeRenderJP() {
        this.isPausedJP = false;
        this.renderJackpot();
    },
    callbackJackpotUpdate(jackpotID, data) {
        if (jackpotID) {
            const currencyPrefix = this._getCurrencyPrefix();
            if (currencyPrefix && !jackpotID.includes(currencyPrefix)) return;
            jackpotID = jackpotID.toString().replace(currencyPrefix, '');
            this.jackpotData[jackpotID] = Number(data);
            const levelData = data.toString().split('_');
            this.newJackpotLevel[jackpotID] = levelData.length > 1 ? Number(levelData[1]) : 1;
        }
        this.renderJackpot();
    },

    _getCurrencyPrefix() {
        if (!this.node.gSlotDataStore || !this.node.gSlotDataStore.currencyCode) return '';
        const currencyCode = this.node.gSlotDataStore.currencyCode;
        let defaultCurrency = this.node.config.DEFAULT_CURRENCY || 'VND';
        const currencyPrefix = (!currencyCode || defaultCurrency === currencyCode) ? '' : `${currencyCode}_`;
        return currencyPrefix;
    },

    updateValueJP(value, type = 0) {
        const { steps, currentBetData } = this.node.gSlotDataStore.slotBetDataStore.data;
        const stepIndex = findKeyByValue(steps, currentBetData).toString();
        let node;
        switch (type) {
            case 0:
                node = this.grand;
                break;
            case 1:
                node = this.major;
                break;
            case 3:
                node = this.minor;
                break;
            case 4:
                node = this.mini;
                break;
            default:
                node = this.grand;
                break;
        }
        this.renderJP({
            node,
            value: value,
            time: 300,
            stepIndex
        });
    },
    _getIndexJpByType(jpType) {
        return this.indexJp[jpType];
    },
    _getLabelByType(jpType) {
        let jpName = jpType.toLowerCase();
        if (this[jpName]) {
            return this[jpName];
        }
        return this.grand;
    },

    isValidJackpotData(data) {
        let { jpId, c: serverCurrency } = data[0];
        if ((serverCurrency && serverCurrency != this.node.gSlotDataStore.currencyCode) || !this.initJackpotData[jpId]) return false;
        return true;
    },

    noticeJackpotWin(data) {
        if (!this.isValidJackpotData(data)) return;
        let { jpId } = data[0];
        let prefixLength = this.node.config.JP_PREFIX_EVENT.length;
        let jpIndex = jpId.charAt(prefixLength);
        // let jpType = jpId.slice(prefixLength + 2);
        const { steps, currentBetData } = this.node.gSlotDataStore.slotBetDataStore.data;
        const betIndex = findKeyByValue(steps, currentBetData).toString();

        if (jpIndex === betIndex) {
            this.pauseRenderJP();
            let time = this.node.config.TIME_SHOW_JACKPOT_EXPLOSION || 3;
            this._callbackPauseJackpotWin = () => {
                this._callbackPauseJackpotWin = null;
                this.resumeRenderJP();
            };
            this.scheduleOnce(this._callbackPauseJackpotWin, time);
        }
    },
    playJackpotExplosion(data, callback) {
        if (!this.isValidJackpotData(data)) return;
        let { jpId, amt, dn, lv} = data[0];
        let prefixLength = this.node.config.JP_PREFIX_EVENT.length;
        let jpIndex = jpId.charAt(prefixLength);
        let jpType = jpId.slice(prefixLength + 2);
        let jpAmount = 1 * amt;
        const { steps, currentBetData } = this.node.gSlotDataStore.slotBetDataStore.data;
        const betIndex = findKeyByValue(steps, currentBetData).toString();

        if (jpIndex === betIndex) {
            this._callbackNotiJp = callback;
            this.updateValueJP(jpAmount, 0);
            this.pauseRenderJP();
            if (lv && lv >= 1) {
                const jpLevel = jpIndex + this.transformJPName(jpType);
                this.newJackpotLevel[jpLevel] = 1;
                this.currentJackpotData[jpLevel] = Number(jpAmount);
                this.showAnimNoticeWinJP(jpAmount, dn, lv, jpType);
            } else {
                this.showAnimWinJp(jpType, jpAmount);
            }
            if (this._callbackPauseJackpotWin) {
                this._callbackPauseJackpotWin();
                this.unschedule(this._callbackPauseJackpotWin);
            }
        }
    },
    showAnimNoticeWinJP(jpAmount, dn = '', lv = 1, jpType = '') {
        if (this.jackpotMultiply) this.jackpotMultiply.emit('SHOW_ANIM_NOTICE_WIN_JP', jpAmount, dn, lv, jpType);
        let time = this.node.config.TIME_SHOW_JACKPOT_EXPLOSION || 3;
        this._callbackHideJpWin = () => {
            this._callbackHideJpWin = null;
            this._callbackNotiJp && this._callbackNotiJp();
            this._callbackNotiJp = null;

            if (this.jackpotMultiply) this.jackpotMultiply.emit('RESET_ANIM_NOTICE');
            this.resumeRenderJP();
        };
        this.scheduleOnce(this._callbackHideJpWin, time);
    },
    showAnimWinJp(jpType, jpAmount) {
        this._playAnimWinJp(jpType, jpAmount);
    },
    _playAnimWinJp(jpType, jpAmount) {
        let spine, labelNode, icon, particle;
        let time = this.node.config.TIME_SHOW_JACKPOT_EXPLOSION || 3;

        let _index = this._getIndexJpByType(jpType);
        spine = this.jackpotIconAnims[_index];
        icon = this.jackpotIcons[_index];
        particle = this.jackpotParticles[_index];
        labelNode = this._getLabelByType(jpType);

        if (!spine || !icon || !particle) {
            cc.warn("Have to implement enought anim for JP explosion", { spine, icon, particle });
            return;
        }

        if (spine && icon) {
            icon.active = false;
            spine.node.active = true;
            spine._animationQueue = [];
            spine.setAnimation(0, "animation", false);
            spine.addAnimation(0, "animation", false);
        }

        if (labelNode && labelNode.active === true) {
            labelNode.initScale = labelNode.initScale ? labelNode.initScale : labelNode.scaleX;
            labelNode.getComponent(cc.Label).string = formatMoney(jpAmount);
            let dur = 0.75, repeatTime = Math.floor(time/(2 * dur));
            labelNode.actionZoom && labelNode.stopAction(labelNode.actionZoom);
            labelNode.actionZoom = cc.repeat(cc.sequence(
                cc.scaleTo(dur, labelNode.initScale + 0.2),
                cc.scaleTo(dur, labelNode.initScale)
            ), repeatTime);
            labelNode.runAction(labelNode.actionZoom);
        }

        if (particle) {
            particle.node.active = true;
            particle.play();
        }

        this._callbackHideJpWin = () => {
            spine.node.active = false;
            icon.active = true;
            particle.node.active = false;
            this._callbackHideJpWin = null;
            this._callbackNotiJp && this._callbackNotiJp();
            this._callbackNotiJp = null;
            this.resumeRenderJP();
        };
        this.scheduleOnce(this._callbackHideJpWin, time);
    },
    stopJackpotExplosion() {
        if (this._callbackHideJpWin) {
            this.unschedule(this._callbackHideJpWin);
            this._callbackHideJpWin();
        }
    },
});
