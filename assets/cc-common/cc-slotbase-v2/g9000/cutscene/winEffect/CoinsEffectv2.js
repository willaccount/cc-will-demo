

cc.Class({
    extends: require('CutsceneMode'),

    properties: {
        coinSpawnerCount: 3,
        coinDropper: cc.Node,
        diamondDropper: cc.Node,
        moneySpawner: cc.Node,
        moneyPrefab: cc.Prefab,
        coinPiles : [cc.Node],
        diamondPiles: [cc.Node],
        coinPipeDelayTime: 1.3,
    },

    onLoad() {
        this.initValue();
        this.node.on('START_PARTICLE', this.startParticle, this);
        this.node.on('STOP_PARTICLE', this.stopParticle, this);
        this.node.on('DROP_MONEY', this.randomDropMoney, this);
        this.node.on('DROP_DIAMOND', this.dropDiamond, this);
        this.duration = 10;
    },  

    initValue(){
        if(!this.moneyPrefab){
            return;
        }

        this.moneyPool = [];
        for(let i = 0; i < 20; ++i) {
            const money = cc.instantiate(this.moneyPrefab);
            money.parent = this.moneySpawner;
            money.opacity = 0;
            this.moneyPool.push(money);
        }
        this.moneySpawner.opacity = 0;
    },

    startParticle(){
        this.coinDropper.opacity = 0;
        this.coinDropper.stopAllActions();
        this.coinDropper.getComponent(cc.ParticleSystem).resetSystem();
        this.coinDropper.runAction(cc.sequence(cc.delayTime(0.2), cc.fadeIn(0.1)));

        this.coinPiles.forEach(pile => {
            pile.opacity = 0;
            pile.stopAllActions();
            pile.setPosition(0, -cc.view.getVisibleSize().height / 2 - 20);
            pile.runAction(cc.sequence( 
                cc.delayTime(this.coinPipeDelayTime),
                cc.callFunc(()=>{
                    pile.getComponent(cc.ParticleSystem).resetSystem();
                }),
                cc.delayTime(0.2),
                cc.fadeIn(0.1),
                cc.moveBy(this.duration, 0, 200)
            ));
        });
    },

    stopParticle(){
        this.coinDropper.stopAllActions();
        this.coinDropper.getComponent(cc.ParticleSystem).stopSystem();
        this.coinPiles.forEach(pile => {
            pile.stopAllActions();
            pile.getComponent(cc.ParticleSystem).stopSystem();
        });
        this.moneySpawner.stopAllActions();
        if(this.diamondDropper) {
            this.diamondDropper.getComponent(cc.ParticleSystem).resetSystem();
            this.diamondDropper.getComponent(cc.ParticleSystem).stopSystem();
            this.diamondPiles.forEach(pile => {
                pile.getComponent(cc.ParticleSystem).resetSystem();
                pile.getComponent(cc.ParticleSystem).stopSystem();
            });
        }
    },

    randomDropMoney(){
        if(!this.moneyPrefab){
            return;
        }
        this.moneyIndex = 0;
        this.moneySpawner.opacity = 255;
        this.moneySpawner.runAction(cc.repeatForever(cc.sequence(
            cc.delayTime(0.3),
            cc.callFunc(()=>{ this.dropMoney(); })
        )));
    },

    dropMoney(){
        const money = this.moneyPool[this.moneyIndex];
        this.moneyIndex = (this.moneyIndex + 1) % this.moneyPool.length;
        money.x = (Math.random() - 0.5) * cc.view.getVisibleSize().width;
        const randomAnimIdx = Math.random() * 3 | 0 + 1;
        const animName = 'TienRoi' + randomAnimIdx;
        money.opacity = 255;
        money.getComponent(sp.Skeleton).setAnimation(0, animName, false);
    },

    dropDiamond() {
        this.diamondDropper.opacity = 0;
        this.diamondDropper.getComponent(cc.ParticleSystem).resetSystem();
        this.diamondDropper.runAction(cc.sequence(cc.delayTime(0.2), cc.fadeIn(0.1)));
    }
});
