

cc.Class({
    extends: cc.Component,
    properties: {
        stopAtScatterNumber: 99,
        stopAtBonusNumber: 3,
        reelParticle: cc.Node,
        reelParticle1: cc.Node,
        sfxNearWin: {
            default: null,
            type: cc.AudioClip,
        },
    },

    start () {
        this.node.on("REEL_STOP_NEARWIN",this.reelStopNearWin,this);
        this.node.on("TABLE_START_NEARWIN",this.reelReset,this);
        this.node.on("REEL_ABOUT_TO_STOP_NEARWIN",this.adjustReelDelay,this);
        
        this.particleList = [];
        if (this.reelParticle) this.particleList.push(this.reelParticle);
        if (this.reelParticle1) this.particleList.push(this.reelParticle1);

        this.reelReset();
    },
    reelReset() {
        this.playSoundNearWin = false;
        this.getFirstNearWin = false;
        this.activeParticleList({ isActive: false, opacity: 0 });
        if (this.node.config.SKIP_NEAR_WIN_TURBO === true && this.node.gSlotDataStore.modeTurbo === true) {
            this.skipNearWin = true;
        }else{
            this.skipNearWin = false;
        }
    },
    adjustReelDelay({reels, data}) {
        let countScatter = 0;
        let countBonus = 0;
        this.nearWinList = [];

        for (let col = 0; col < data.length; ++col) {
            const isNearWinScatter = countScatter >= 2;
            const isNearWinBonus = countBonus >= 2;
            const isNearWin = isNearWinScatter || isNearWinBonus;

            for (let row = 0; row < data[col].length; ++row) {
                const symbolValue = data[col][row];
                if (symbolValue === 'R') {
                    countBonus++;
                } else if (symbolValue === 'A') {
                    countScatter++;
                }
            }

            if (isNearWin) {
                this.nearWinList[col] = {isNearWinScatter, isNearWinBonus, isNearWin};
                reels[col].extendTimeToStop();
            }

            this.getFirstNearWin = countBonus >= this.stopAtBonusNumber || countScatter >= this.stopAtScatterNumber;
        }
    },
    reelStopNearWin({count, context}) {
        //back to normal mode, normal speed....
        //Where to calculate this???
        if (this.getFirstNearWin && !context.isFastToResult) {
            for (let i = count; i < this.node.reels.length; i++) {
                this.node.reels[i].adjustReelSpeed(this.node.curentConfig.TIME);
                if (this.nearWinList[i] && this.nearWinList[i].isNearWin) {
                    this.nearWinList[i].isNearWin = false;
                }
            }
            this.hideParticleList(0, .5);
            context.isFastToResult = true;
        }

        if (this.nearWinList[count] && this.nearWinList[count].isNearWin && !context.isFastToResult) {

            if (this.playSoundNearWin === false) {
                this.playSoundNearWin = true;
                if (this.node.soundPlayer) {
                    this.nearWinSoundKey = this.node.soundPlayer.playSound(this.sfxNearWin);
                }
            }
            const x = context.getXPosition(count) - this.node.config.TABLE_SHIFT_X - 15;
            const x1 = context.getXPosition(count + 1) - this.node.config.TABLE_SHIFT_X - 15;

            this.activeParticleList({ isActive: true, opacity: 255 });
            this.setPosParticleList([x, x1]);

            for (let i = count; i < this.node.reels.length; i++) {
                this.node.reels[i].adjustReelSpeed(this.node.config.SUPER_TURBO);
            }

            if (count === (this.node.reels.length - 1)) {
                cc.director.getScheduler().schedule(function(){
                    this.node.reels[count].adjustReelSpeed(this.node.curentConfig.TIME);
                }, this, 0, 0, 1, false);
            }

            //TODO: wonder do we need to
            if (this.nearWinList[count].isNearWinScatter) {
                this.runAnimationNearWin('A', count);
            }

            if (this.nearWinList[count].isNearWinBonus) {
                this.runAnimationNearWin('R', count);
            }
        }
        if (count >= this.node.reels.length) {
            if (this.nearWinList[count - 1] && this.nearWinList[count - 1].isNearWinScatter < 3 && this.nearWinList[count - 1].isNearWinBonus < 3) {
                this.clearBonusPaylines();
            }
            this.hideParticleList({ isActive: false });
        }
    },
    hideParticleList() {
        // will do making some animation on these particles late.
        // currently will hidden right now.
        this.activeParticleList({ isActive: false, opacity: 0 });
        if (this.node.soundPlayer && this.nearWinSoundKey) {
            this.node.soundPlayer.stopSound(this.nearWinSoundKey);
            this.nearWinSoundKey = null;
        }
    },
    activeParticleList(object) {
        for (let i = 0; i < this.particleList.length; i++) {
            const item = this.particleList[i];
            if (object.isActive !== undefined) {
                item.active = object.isActive;
            }
            if (object.opacity !== undefined) {
                item.opacity = object.opacity;
            }
        }
    },
    setPosParticleList(posArr) {
        for (let i = 0; i < this.particleList.length; i++) {
            this.particleList[i].x = posArr[i];
        }
    },

    clearBonusPaylines(){},
    runAnimationNearWin(){},
});
