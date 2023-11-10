const FLYING_DIRECTION = ['L', 'R', 'M'];
cc.Class({
    extends: cc.Component,

    properties: {
        fishFlyingHolder: cc.Node,
        vfxWaterLight: cc.Node,
        fishFlyingPrefab: cc.Prefab,
    },

    onLoad() {
        this.node.on("PLAY_FISH_FLYING_EFFECT", this.playFishFlyingEffect, this);
        this.node.on("SPEED_UP_FISH_FLYING_EFFECT", this.speedUpFishFlyingEffect, this);
        this.node.on("STOP_FISH_FLYING_EFFECT", this.stopFishFlyingEffect, this);
        this.node.on("PLAY_SOUND_FISH_FLYING_END", this.playSoundFishFlyingEnd, this);
        window.fishFlying = this;
        this.allFishFlyingData = new Array(5).fill(null);
        // this.calculateAllAnimationTime();
    },

    playFishFlyingEffect(fishFlyingData) {
        const { animationName, delayTime, timeScaleRate, skinName,  } = this.getAnimationInfo(fishFlyingData);
        const fishSpine = this.getFishFlyingSkeleton();
        const fishSkeleton = fishSpine.getComponent(sp.Skeleton);
        fishSpine.opacity = 0;
        this.allFishFlyingData[fishFlyingData.col] = fishFlyingData;
        fishSpine.col = fishFlyingData.col;
        fishSpine.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.callFunc(() => {
                if (this.vfxWaterLight.opacity === 0) {
                    this.vfxWaterLight.opacity = 255;
                    this.vfxWaterLight.getComponent(cc.Animation).play();
                }
                this.playSoundFishFlying(fishFlyingData, skinName === 'Gold');
                fishSpine.isPlayingAnim = true;
                fishSpine.opacity = 255;
                fishSkeleton.timeScale = timeScaleRate;
                fishSkeleton.setSkin(skinName);
                fishSkeleton.setAnimation(0, animationName, false);
                fishSkeleton.setCompleteListener(() => {
                    this.fishFlyingHolder.removeChild(fishSpine);
                });
            }),
        ));
    },

    playSoundFishFlying(fishFlyingData, isGoldFish = false) {
        const { isTurbo, lastWildColumn, col } = fishFlyingData;
        if (isTurbo) {
            if (lastWildColumn === col) {
                this.node.soundPlayer.playSfxFishFlying(isGoldFish);
            }
        } else {
            this.node.soundPlayer.playSfxFishFlying(isGoldFish);
        }
    },

    playSoundFishFlyingEnd(col) {
        if (!this.allFishFlyingData[col]) return;
        const { isWinWild, isMultiple, multipleValue } = this.allFishFlyingData[col];
        if (isMultiple && multipleValue > 5) {
            this.node.soundPlayer.playSfxGoldFishWin();
        } else if (isWinWild) {
            this.node.soundPlayer.playSfxSilverFishWin();
        }
    },

    speedUpFishFlyingEffect(fishFlyingData) {
        const { animationName, timeScaleRate, skinName } = this.getAnimationInfo(fishFlyingData);
        if (this.fishFlyingHolder.children && this.fishFlyingHolder.children.length) {
            const listFishFlying = this.fishFlyingHolder.children.slice();
            listFishFlying.forEach(fishSpine => {
                if (!fishSpine.isSpeedUp && fishSpine.col === fishFlyingData.col) {
                    fishSpine.stopAllActions();
                    fishSpine.opacity = 255;
                    fishSpine.isSpeedUp = true;
                    const fishSkeleton = fishSpine.getComponent(sp.Skeleton);
                    fishSkeleton.setCompleteListener(() => {});
                    if (!fishSpine.isPlayingAnim) {
                        fishSpine.isPlayingAnim = true;
                        fishSkeleton.setSkin(skinName);
                        fishSkeleton.setAnimation(0, animationName, false);
                        fishSkeleton.setCompleteListener(() => {
                            this.fishFlyingHolder.removeChild(fishSpine);
                        });
                    }
                    fishSkeleton.timeScale = timeScaleRate;
                }
            });
        }
    },

    getFishFlyingSkeleton() {
        const fishSpine = cc.instantiate(this.fishFlyingPrefab);
        fishSpine.parent = this.fishFlyingHolder;
        return fishSpine;
    },

    getAnimationInfo({timeStop, row, col, isWinWild, isMultiple, multipleValue}) {
        const randomIndex = Math.floor(Math.random() * FLYING_DIRECTION.length);
        let animationName = `row${row + 1}_col${col + 1}_${FLYING_DIRECTION[randomIndex]}`;
        let skinName = isMultiple && multipleValue > 5 ? 'Gold' : 'Silver';
        // if (!isWinWild) {
        //     animationName = 'miss_' + FLYING_DIRECTION[randomIndex];
        //     skinName = Math.random() < 0.5 ? 'Gold' : 'Silver';
        // }
        const fishFlyingTime = 1.35;
        const fishFlyingMissTime = 1.5;
        const animationTime = isWinWild ? fishFlyingTime : fishFlyingMissTime;
        let delayTime = 0;
        let timeScaleRate = 1;
        if (timeStop >= animationTime) {
            delayTime = timeStop - animationTime;
        } else {
            timeScaleRate = animationTime / timeStop;
        }
        return { animationName, delayTime, timeScaleRate, skinName, animationTime };
    },

    stopFishFlyingEffect() {
        this.allFishFlyingData = new Array(5).fill(null);
        this.vfxWaterLight.runAction(cc.fadeOut(0.3));
    },

    calculateAllAnimationTime() {
        this.animationDataStore = {};
        this.listAnimations = [];
        for (const animationName in this.fishSkeleton.skeletonData.skeletonJson.animations) {
            this.listAnimations.push(animationName);
        }
        this.playAnimation(0);
    },

    playAnimation(count) {
        if (!this.listAnimations[count]) {
            cc.log(this.animationDataStore, 'finish calculate all animation time');
            return;
        }
        this.fishSkeleton.setAnimation(0, this.listAnimations[count], false);
        const startTime = new Date().getTime();
        this.fishSkeleton.setCompleteListener(() => {
            const endTime = new Date().getTime();
            const changeTime = (endTime - startTime) / 1000;
            this.animationDataStore[this.listAnimations[count]] = changeTime;
            this.fishSkeleton.setCompleteListener(() => { });
            this.playAnimation(count + 1);
        });
    },
});
