

const { tweenObject, tweenLooping } = require('globalAnimationLibrary');

const typeOfWinEffArr = ["big", "mega", "super"];

cc.Class({
    extends: cc.Component,
    properties: {
        BG: cc.Node,
        textHolder: cc.Node,
        parttern: cc.Node,
        coinHolder: cc.Node,
        coinHolderFront: cc.Node,
        lightHolder: cc.Node,
        winAmount: cc.Node,
        lightingParticleBottom: cc.ParticleSystem,
        particle3DEffect: false,
        particle3DSpeed: 10,

        particleNode: {
            type: cc.Node,
            default: []
        },

        particleElements: {
            type: cc.SpriteFrame,
            default: []
        },

        prefabData: {
            type: cc.Prefab,
            default: []
        },
        spriteData: {
            type: cc.SpriteFrame,
            default: []
        },
    },

    onLoad() {
        this.node.gSlotWinEffect = this;
        this.config();
    },


    reformatAssets(coinSprite) {
        this.winAssets = {
            prefabData: {},
            spriteData: {},
            particleNode: {},
            particleElements: {}
        };

        this.winAssets.prefabData = this.formatAssets(this.prefabData);
        this.winAssets.spriteData = this.formatAssets(this.spriteData);
        this.winAssets.particleNode = this.formatAssets(this.particleNode);
        this.winAssets.particleElements = this.formatSpriteAssets(coinSprite);
    },

    formatAssets(asset) {
        let object = {};
        let count = 0;
        for (let i = 0; i < asset.length; i++) {
            if (asset[i] != null) {
                count++;
                object[asset[i]._name] = asset[i];
                object[i] = asset[i];
            }
        }

        object["total"] = count;
        return object;
    },

    formatSpriteAssets(asset) {
        let object = {};
        let count = 0;
        for (const sprite in asset) {
            if (asset[sprite].name.includes('coin2')) {
                count++;
                object[asset[sprite].name] = asset[sprite];
            }
        }
        object["total"] = count;
        if (count > 0) {
            this.useCoinSprite = true;
        }
        return count > 0 ? object : this.formatAssets(this.particleElements);
    },

    config() {
        //cofig particle
        this.particleTotal = { min: 1, max: 6 };
        this.particleGravityY = { min: -500, max: -2500 };
        this.particleSpeed = { min: 20, max: 50 };
        this.particleSpeedVar = { min: 30, max: 100 };
        this.particleStartPosY = 200;

        //cofig coin
        this.maxCoin = 8;
        this.coinSpeed = { min: .005, max: .01 };
        this.coinPosY = { min: -540, max: -240 };

        //cofig light
        this.lightSpeed = { min: .1, max: .3 };
        this.lightPositionArr = [
            { dx: 600, dy: -110, sc: .7 },
            { dx: 0, dy: -130, sc: 1.2 },
            { dx: -600, dy: -110, sc: .7 }
        ];

        this.currentPer = 0;
        this.lastPer = 0;
        this.winLevel = null;
    },

    // use this for initialization
    init(id, spriteData) {
        //config for win effect;
        this.config();
        this.useCoinSprite = false;
        //reformat assets.
        this.reformatAssets(spriteData);
        ///

        this.resetTitleHolder(this.textHolder);

        this.setUpLighting(this.lightHolder, this.lightPositionArr, this.winAssets.prefabData["WinningLighting"]);
        this.setUpGroupCoin(this.coinHolder, this.maxCoin, this.winAssets.prefabData["WinningGroupCoin"]);
        this.setUpGroupCoin(this.coinHolderFront, this.maxCoin, this.winAssets.prefabData["WinningGroupCoin"]);
        this.setUpParticleEff();
        this.winAssets.particleNode["ParticleHolderBottom"].opacity = .5;
        this.winAssets.particleNode["ParticleHolderFront"].opacity = .3;

        //looping animation
        tweenLooping(this.parttern, { dur: .5, opacity: { from: 255 * .5, to: 255 } });
        tweenLooping(this.textHolder, { dur: .3, scale: { from: this.textHolder.scaleX, to: this.textHolder.scaleX + 0.05 } });

        this.setWinEff(id);
        this.onUpdateSpeed();

        this.winAmount.string = '';

        this.showFn();

    },

    enterFrame(per, finalWin) {
        if (per > 1) per = 1;
        if (per < 0) per = 0;

        if(this.winLevel == null){
            this.winLevel = 1;
            switch (finalWin) {
                case 'big':
                    this.winLevel = .5;
                    break;
                case 'mega':
                    this.winLevel = .7;
                    break;
            }
        }

        this.lastPer = per * this.winLevel;
    },

    onUpdateSpeed() {
        this.isStartEff = true;
    },

    update(){
        if(this.isStartEff){
            if (!this || !this.coinSpeed) {
                this.isStartEff = false;
                return;
            }
            this.currentPer += (this.lastPer - this.currentPer) / 5;

            const coinSP = this.coinSpeed.min + (this.coinSpeed.max - this.coinSpeed.min) * this.currentPer;
            const lightSP = this.lightSpeed.min + (this.lightSpeed.max - this.lightSpeed.min) * this.currentPer;

            this.setGroupCoinSpeed(this.coinHolder, coinSP);
            this.setGroupCoinSpeed(this.coinHolderFront, coinSP);
            this.setLightingSpeed(this.lightHolder, lightSP);

            this.updateParticleSpeed(this.currentPer);

            const posY = this.coinPosY.min + (this.coinPosY.max - this.coinPosY.min) * this.currentPer;
            this.coinHolder.y = posY;
            this.coinHolderFront.y = posY;
            this.lightHolder.y = posY;
        }
    },

    hideFn(callback) {
        const easing = cc.easeSineIn();
        const dur = 1;
        this.node.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(() => {
            tweenObject(this.node, {
                dur: dur, opacity: 0, easing: easing, callback: () => {
                    this.exit();
                    callback();
                }
            });

            this.stopParticleEff();
        })));
    },

    showFn() {
        const easing = cc.easeSineOut();
        const dur = .5;

        this.node.active = true;
        this.node.opacity = 0;
        tweenObject(this.node, { dur: dur, opacity: 255, easing: easing});
    },

    setUpParticleEff() {
        for (let i = 0; i < this.particleNode.length; i++){
            const particleNodeItem = this.particleNode[i];
            this.initParticleItem(particleNodeItem, i);
        }
        //
        this.lightingParticleBottom.resetSystem();
    },

    initParticleItem(particleHolder, index) {
        const left = particleHolder.getChildByName("left");
        const right = particleHolder.getChildByName("right");
        const particleArr = [left, right];
        const totalElements = this.winAssets.particleElements.total;

        particleHolder.count = 0;
        for (let i = 0; i < particleArr.length; i++) {
            const particleItem = cc.instantiate(this.winAssets.prefabData["WinningParticle"]);
            particleItem.parent = particleArr[i];

            let spriteFrameID = Math.min(index * 2 + i, totalElements);
            if (this.particle3DEffect) {
                particleItem.count = 0;
                particleItem.spriteFrameCountID = Math.floor(Math.random() * totalElements);
                particleItem.totalSpriteFrame = totalElements;
                spriteFrameID = particleItem.spriteFrameCountID;
            }
            particleItem.getComponent(cc.ParticleSystem).spriteFrame = this.winAssets.particleElements[this.useCoinSprite ? `coin${200 + spriteFrameID}` : spriteFrameID];
            particleItem.y = this.particleStartPosY;
            particleItem.active = false;
            this.randomShowParticle(particleItem);
        }

        //
        this.setParticleSpeed(particleHolder, 0);

    },

    randomShowParticle(particleItem) {
        this.scheduleOnce( ()=> {
            const particleSystem = particleItem.getComponent(cc.ParticleSystem);
            particleSystem.resetSystem();
            particleItem.active = true;
        }, Math.random() * 3);
    },

    setParticleSpeed(particleHolder, sp) {
        const left = particleHolder.getChildByName("left");
        const right = particleHolder.getChildByName("right");
        const particleArr = [left, right];

        for (let i = 0; i < particleArr.length; i++) {
            const particleItem = particleArr[i];
            for (var j = 0; j < particleItem.children.length; j++) {
                const particleNode = particleItem.children[j];
                if (particleNode) {
                    const item = particleNode.getComponent(cc.ParticleSystem);

                    // item.totalParticles = Math.floor(this.particleTotal.min + (this.particleTotal.max - this.particleTotal.min)*sp);
                    item.gravity.y = this.particleGravityY.min + (this.particleGravityY.max - this.particleGravityY.min)*sp;
                    item.speed = this.particleSpeed.min + (this.particleSpeed.max - this.particleSpeed.min)*sp;
                    item.speedVar = this.particleSpeedVar.min + (this.particleSpeedVar.max - this.particleSpeedVar.min) * sp;

                    //3d particle effect.
                    if (this.particle3DEffect) {
                        particleNode.count++;
                        if (particleNode.count >= this.particle3DSpeed) {
                            particleNode.count = 0;
                            if (particleNode.spriteFrameCountID >= particleNode.totalSpriteFrame) {
                                particleNode.spriteFrameCountID = 0;
                            }
                            item.spriteFrame = this.winAssets.particleElements[this.useCoinSprite ? `coin${200 + particleNode.spriteFrameCountID}` : particleNode.spriteFrameCountID];
                            particleNode.spriteFrameCountID++;
                        }
                    }
                }
            }
        }
    },

    stopParticleEff(isRemove = false) {
        for (let i = 0; i < this.particleNode.length; i++){
            const particleNodeItem = this.particleNode[i];
            this.stopParticleItem(particleNodeItem, isRemove);
        }
        //
        this.lightingParticleBottom.stopSystem();
    },

    stopParticleItem(particleHolder, isRemove) {
        const left = particleHolder.getChildByName("left");
        const right = particleHolder.getChildByName("right");
        const particleArr = [left, right];
        for (let i = 0; i < particleArr.length; i++) {
            const particleItem = particleArr[i];
            for (var j = 0; j < particleItem.children.length; j++) {
                const itemNode = particleItem.children[j];
                const item = itemNode.getComponent(cc.ParticleSystem);
                if(!isRemove) item.stopSystem();
                else {
                    itemNode.destroy();
                }
            }
        }
    },

    updateParticleSpeed(sp) {
        if (!this.particleNode || !this.particleNode.length) return;

        for (let i = 0; i < this.particleNode.length; i++) {
            const particleNodeItem = this.particleNode[i];
            this.setParticleSpeed(particleNodeItem, sp);
        }
    },

    setWinEff(id) {
        var winName = typeOfWinEffArr[id];
        this.BG.getComponent(cc.Sprite).spriteFrame = this.winAssets.spriteData["winning-bg-" + winName];
        this.parttern.getComponent(cc.Sprite).spriteFrame = this.winAssets.spriteData["winning-parttern-" + winName];
        this.changeTitle(this.textHolder, winName);
    },

    changeTitle(textHolder, name) {
        const title = textHolder.getChildByName("title");
        this.resetTitle(title);
        const intiSC = title.scaleX;
        tweenObject(title, {dur: .5, scale: intiSC * 1.5, opacity: 0, easing: cc.easeBackIn(), callback: () => {
            title.getComponent(cc.Sprite).spriteFrame = this.winAssets.spriteData["winning-title-" + name];
            tweenObject(title, {dur: .5, scale: intiSC, opacity: 255, easing: cc.easeBackOut(), callback: () => {

            }});
        }});
    },

    resetTitle(title) {
        title.stopAllActions();
        title.scaleX = 1;
        title.scaleY = 1;
    },
    resetTitleHolder(titleHolder) {
        titleHolder.stopAllActions();
        titleHolder.scaleX = 1;
        titleHolder.scaleY = 1;
    },

    resetGroupHolder(groupHolder) {
        for (var i = 0; i < groupHolder.children.length; i++) {
            groupHolder.children[i].destroy();
        }
    },

    setUpLighting(lightHolder, lightPositionArr, lightPrefab) {
        this.resetGroupHolder(lightHolder);
        lightHolder.y = this.lightHolder.min;
        //
        for (var i = 0; i < lightPositionArr.length; i++) {
            const lightItem = cc.instantiate(lightPrefab);
            this.initLighting(lightItem, lightPositionArr[i]);
            lightItem.parent = lightHolder;
        }
    },

    initLighting(lightItem, paramItem) {
        const randomRotaSP = .5;
        const randomScaleSP = 1;

        lightItem.x = paramItem.dx;
        lightItem.y = paramItem.dy;
        lightItem.initRotaSP = Math.random() * randomRotaSP + randomRotaSP;
        lightItem.rotaSP = lightItem.initRotaSP;

        lightItem.initSC = Math.random() * randomScaleSP + paramItem.sc;
        lightItem.scaleX = lightItem.scaleY = lightItem.initSC;
        lightItem.scaleSP = lightItem.initSC;
    },

    setLightingSpeed(lightHolder, sp) {
        if (!lightHolder || !lightHolder.children || !lightHolder.children.length) return;

        for (var i = 0; i < lightHolder.children.length; i++) {
            const lightItem = lightHolder.children[i];
            lightItem.angle += sp;
            lightItem.scaleX = lightItem.scaleY = lightItem.initSC + (Math.random() - Math.random()) * sp;
        }
    },

    setUpGroupCoin(coinHolder, n, coinGroupPrefab) {

        this.resetGroupHolder(coinHolder);
        coinHolder.y = this.coinPosY.min;
        //
        let posID = 0;
        let isRight = false;
        for (var i = 0; i < n; i++) {
            const coinItem = cc.instantiate(coinGroupPrefab);

            //reset position ID and swtich to right side.
            if (!isRight && i >= n / 2) {
                isRight = true;
                posID = 0;
            }

            this.initGroupCoin(coinItem, posID, n, isRight);
            coinItem.parent = coinHolder;

            posID++;
        }
    },

    initGroupCoin(coinItem, posID, total, isRight) {
        const padd_x = -250;
        const padd_y =  300;
        const start_y = -50;

        const stageWidth = 1920;
        const sc = 1 + posID/1.5;
        const paddingX = padd_x * posID;
        const paddingY = start_y - posID * padd_y;

        coinItem.anchorX = (Math.random() - Math.random()) * .05 + .5;
        coinItem.anchorY = (Math.random() - Math.random()) * .05 + .5;

        coinItem.x = isRight ? stageWidth + paddingX : -paddingX;
        coinItem.y = paddingY;
        coinItem.isRight = isRight;
        coinItem.scaleX = Math.random() > .5 ? sc : sc * -1;
        coinItem.scaleY = Math.random() > .5 ? sc : sc * -1;

        coinItem.maxOpacity = 125*(1-posID/(total/2-1));

    },

    setGroupCoinSpeed(coinHolder, sp) {
        if (!coinHolder || !coinHolder.children || !coinHolder.children.length) return;

        for (var i = 0; i < coinHolder.children.length; i++) {
            const coinItem = coinHolder.children[i];
            coinItem.angle += coinItem.isRight ? sp : -sp;
            const c = coinItem.maxOpacity*this.lastPer;
            if (coinItem.getChildByName("coin"))
                coinItem.getChildByName("coin").color = new cc.Color(255-c,255-c,255-c,255);
        }
    },

    updateData() {

    },
    reset() {

    },

    exit() {
        this.isStartEff = false;
        this.node.active = false;
        this.resetGroupHolder(this.coinHolder);
        this.resetGroupHolder(this.coinHolderFront);
        this.resetGroupHolder(this.lightHolder);
        this.stopParticleEff(true);
        this.winAmount.resetValue();
        this.parttern.stopAllActions();
        this.changeTitle(this.textHolder, typeOfWinEffArr[0]);
        this.textHolder.stopAllActions();
        this.resetTitleHolder(this.textHolder);
        this.resetTitle(this.textHolder.getChildByName("title"));
        this.textHolder.getChildByName("title").getComponent(cc.Sprite).spriteFrame = this.winAssets.spriteData["winning-title-" + typeOfWinEffArr[0]];
    }
});
