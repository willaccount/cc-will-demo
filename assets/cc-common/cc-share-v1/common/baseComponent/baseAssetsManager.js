

cc.Class({

    properties: {},

    onCheckAllResource(resourcePrefix, callbackProgress, callbackLoaded) {
        this.loaded = false;
        this.loadSpine = 0;
        this.loadSound = 0;
        this.loadPrefab = 0;
        this.loadSharePrefab = 0;
        this.loadSprite = 0;
        this.loadParticle = 0;
        this.prefabData = {};
        this.spriteData = {};
        this.spineData = {};
        this.particleData = {};
        this.soundData = {};

        this.total = 6;

        cc.loader.loadResDir(resourcePrefix + "/Sprite", cc.SpriteFrame, (loaded,total) => {
            this.loadSprite = total ? loaded/total : 1;
            this.checkResourceProgress(callbackProgress);
        }, (err, assets) => {
            
            for (let i = 0; i < assets.length; i++) {
                this.spriteData[assets[i]._name] = assets[i];
            }
            this.loadSprite = 1;
            this.checkResourceFinish(callbackLoaded);
        });

        cc.loader.loadResDir(resourcePrefix + "/Particle", cc.Particle, (loaded,total) => {
            this.loadParticle = total ? loaded/total : 1;
            this.checkResourceProgress(callbackProgress);
        }, (err, assets, urls) => {
            for (let i = 0; i < assets.length; i++) {
                const symbolText = urls[i].replace(resourcePrefix + '/Particle/', '').split('/');
                if (!this.particleData[symbolText[0]]) {
                    this.particleData[symbolText[0]] = {};
                }
                this.particleData[symbolText[0]][symbolText[1]] = assets[i];
            }
            this.loadParticle = 1;
            this.checkResourceFinish(callbackLoaded);
        });


        cc.loader.loadResDir(resourcePrefix + "/SFX", cc.AudioClip, (loaded,total) => {
            this.loadSound = total ? loaded/total : 1;
            this.checkResourceProgress(callbackProgress);
        }, (err, assets) => {
            for (let i = 0; i < assets.length; i++) {
                this.soundData[assets[i]._name] = assets[i];
            }
            this.loadSound = 1;
            this.checkResourceFinish(callbackLoaded);
        });

        cc.loader.loadResDir(resourcePrefix + "/Prefab", cc.Prefab, (loaded,total) => {
            this.loadPrefab = total ? loaded/total : 1;
            this.checkResourceProgress(callbackProgress);
        }, (err, assets) => {
            for (let i = 0; i < assets.length; i++) {
                this.prefabData[assets[i]._name] = assets[i];
            }
            this.loadPrefab = 1;
            this.checkResourceFinish(callbackLoaded);
        });

        cc.loader.loadResDir("share/Prefab", cc.Prefab, (loaded,total) => {
            this.loadSharePrefab = total ? loaded/total : 1;
            this.checkResourceProgress(callbackProgress);
        }, (err, assets) => {
            for (let i = 0; i < assets.length; i++) {
                this.prefabData[assets[i]._name] = assets[i];
            }
            this.loadSharePrefab = 1;
            this.checkResourceFinish(callbackLoaded);
        });

        cc.loader.loadResDir(resourcePrefix + "/Spine", sp.SkeletonData, (loaded,total) => {
            this.loadSpine = total ? loaded/total : 1;
            this.checkResourceProgress(callbackProgress);
        }, (err, assets, urls) => {
            for (let i = 0; i < assets.length; i++) {
                const symbolText = urls[i].replace(resourcePrefix + '/Spine/', '').replace('/skeleton', '');
                this.spineData[symbolText] = assets[i];
            }
            this.loadSpine = 1;
            this.checkResourceFinish(callbackLoaded);
        });
    },

    checkResourceProgress(callbackProgress) {
        let percent = (this.loadSprite + this.loadSpine + this.loadSound + this.loadPrefab + this.loadSharePrefab + this.loadParticle)/this.total*100;
        callbackProgress(Math.floor(percent));
    },
    checkResourceFinish(callbackLoaded) {
        if (this.loaded) return;
        if (this.loadSprite + this.loadSpine + this.loadSound + this.loadPrefab + this.loadSharePrefab + this.loadParticle == this.total) {
            this.loaded = true;
            callbackLoaded();
        }
    }
});
