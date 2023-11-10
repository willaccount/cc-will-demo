
cc.Class({
    extends: cc.Component,

    properties: {
        display: cc.Node,
        fgoSymbol: cc.Prefab,
        delayStop: 2,
        rollingSpeed: 2000,
        glow: cc.Node,
    },

    onLoad () {
        this.node.on('INIT', this.init, this);
        this.node.on('RESET', this.reset, this);
        this.node.on('MYSTERY_CHOICE', this.roll, this);
        this.node.on('STOP_ROLL', this.stop, this);
    },

    init(symbolList){
        this.symbolList = symbolList.slice();
        this.defaultSprite = this.symbolList[3];
        this.symbolList.splice(3, 1);
        this.height =  this.node.height;
        for(let i = 0; i < 3; ++i) {
            const symbol = cc.instantiate(this.fgoSymbol);
            symbol.parent = this.display;
        }
        this.reset();
        this.isRolling = false;
    },

    getRandomSymbol() {
        return this.symbolList[this.symbolList.length * Math.random() | 0];
    },

    reset(){
        this.pass = 1;
        this.glow.opacity = 255;
        this.glow.scale = 1;
        this.glow.getComponent(cc.Sprite).spriteFrame = this.defaultSprite;
        this.display.opacity = 0;
        for(let i = 0; i < 3; ++i) {
            const symbol = this.display.children[i];
            symbol.getComponent(cc.Sprite).spriteFrame = this.getRandomSymbol();
            symbol.y = i * this.height;
            symbol.setSiblingIndex(i);
        }
        this.display.y = 0;
        this.speedY = 0.0;
        this.display.children[0].getComponent(cc.Sprite).spriteFrame = this.defaultSprite;
    },

    roll(callback){
        this.glow.opacity = 0;
        this.display.opacity = 255;
        this.isRolling = true;
        this.display.runAction(cc.sequence(
            cc.moveBy(0.2, 0, 0.5 * this.height).easing(cc.easeCubicActionIn()),
            cc.callFunc(()=>{
                this.speedY = -this.rollingSpeed;
                for(let i = 0; i < 3; ++i) {
                    this.display.children[i].emit('ACTIVE_BLUR', 0.03);
                    this.display.children[i].scaleY = 2;
                }
                callback && callback();
            })
        ));
    },

    stop(result, callback){
        this.node.runAction(cc.sequence(
            cc.delayTime(this.delayStop),
            cc.callFunc(()=>{
                this.isRolling = false;
                this.speedY = 0;
                for(let i = 0; i < 3; ++i) {
                    this.display.children[i].emit('STOP_BLUR');
                    this.display.children[i].scaleY = 1;
                }
                const symbol = this.display.children[2];
                symbol.getComponent(cc.Sprite).spriteFrame = this.symbolList[result - 1];
                const gapY = Math.abs(this.display.y) - this.height * (this.pass - 1);
                this.display.runAction(cc.sequence(
                    cc.moveBy(0.01, 0, -this.height * 2),
                    cc.moveBy(0.3, 0, gapY),
                    cc.callFunc(()=>{
                        this.glow.getComponent(cc.Sprite).spriteFrame = this.symbolList[result - 1];
                        this.glow.opacity = 200;
                        this.glow.scale = 1;
                        cc.tween(this.glow).to(0.5, {opacity: 0, scale: 2}).start();
                    }),
                    cc.delayTime(2),
                    cc.callFunc(()=>{
                        callback && callback();
                    })
                ));
            })
        ));
    },

    circularSymbol(){
        const symbol = this.display.children[0];
        symbol.y += this.height * 3;
        symbol.getComponent(cc.Sprite).spriteFrame = this.getRandomSymbol();
        symbol.setSiblingIndex(2);
    },

    update(dt){
        if(!this.isRolling) return;
        this.updatePosition(dt);
        while(this.display.y <= -this.height * this.pass) {
            this.circularSymbol();
            ++this.pass;
        }
    },

    updatePosition(dt){
        this.display.y += this.speedY * dt;
    }
});
