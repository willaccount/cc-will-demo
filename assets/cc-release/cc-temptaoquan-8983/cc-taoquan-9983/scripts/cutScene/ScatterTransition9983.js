
cc.Class({
    extends: require('CutsceneMode'),

    properties: {
        particleNode: cc.Node,
        table: cc.Node,
        destPos: cc.Node,
        plus1fx: cc.Node,
    },

    onLoad() {
        this._super();
        this.plus1fx.storePos = this.plus1fx.position;
    },

    enter() {
        const {matrix,isNormal} = this.content;
        this.plus1fx.opacity = 0;
        this.parList = [];
        if(!isNormal){
            let scatCoorList = [];
            for(let i = 0; i < matrix.length; ++i){
                let j = 0;
                for(; j < matrix[i].length; ++j){
                    if(matrix[i][j] === 'A'){
                        scatCoorList.push(cc.v2(i,j));
                        break;
                    }
                }
                if(j >= matrix[i].length) break;
            }
            this.playAnim(scatCoorList);
        }
        else
            this.scrollAnim();
    },
    playAnim(arrCoor){
        for(let i = 0; i < arrCoor.length; ++i){
            let particle = cc.instantiate(this.particleNode);
            particle.parent = this.table;
            particle.active = true;
            particle.x = this.getXPosition(arrCoor[i].x);
            let colCount = (0< arrCoor[i].x && arrCoor[i].x <4) ? 4 : 4;
            let height = (this.node.config.SYMBOL_HEIGHT/1) * 0.87;
            particle.y =  (colCount - arrCoor[i].y) * height - height/2;
            this.parList.push(particle);
            const delayTime = 0.25;
            cc.tween(particle)
                .to(0.5, {x: this.destPos.x, y: this.destPos.y})
                .call(()=>{
                    this.plus1fx.opacity = 255;
                    this.plus1fx.position = this.plus1fx.storePos;
                    this.plus1fx.runAction(cc.spawn(
                        cc.fadeOut(delayTime),
                        cc.moveBy(delayTime, 0, 10),
                    ));
                })
                .delay(delayTime)
                .call(()=>{
                    this.exit();
                })
                .start();
        }
    },
    scrollAnim(){
        let overlay = this.node.getChildByName('overlay');
        cc.tween(overlay)
            .to(0.75, {opacity: 150})
            .call(()=>{
                // let particle = this.node.getChildByName('phaohoa');
                // particle.active = true;
            })
            .start();

        cc.tween(this)
            .call(()=>{
                this.isScrolling = true;
                let rollLeft = this.node.getChildByName('Roll_Left');
                cc.tween(rollLeft)
                    .to(0.5, {opacity: 255})
                    .to(0.7, {x: -300, y: -30, angle: 15}, {easing: 'backOut'})
                    .start();
                let rollRight = this.node.getChildByName('Roll_Right');
                cc.tween(rollRight)
                    .to(0.5, {opacity: 255})
                    .to(0.7, {x: 300, y: -30, angle: -15}, {easing: 'backOut'})
                    .start();
                let scroll = this.node.getChildByName('scroll');
                cc.tween(scroll)
                    .to(0.5, {opacity:255})
                    .start();
            })
            .delay(1.25)
            .call(()=>{
                let overlay = this.node.getChildByName('overlay');
                cc.tween(overlay)
                    .call(()=>{
                        // let particle = this.node.getChildByName('phaohoa');
                        // particle.active = true;
                    })
                    .to(0.75, {opacity: 0})
                    .start();
            })
            .delay(0.25)
            .call(()=>{
                if (this.callback && typeof this.callback == "function") {
                    this.node.emit("STOP");
                    this.callback();
                }
            })
            .delay(1.5)
            .call(()=>{
                this.isScrolling = false;
                this.exitForNormal();
            })
            .start();

    },

    update(){
        if(this.isScrolling){
            let rollLeft = this.node.getChildByName('Roll_Left');
            let rollRight = this.node.getChildByName('Roll_Right');
            let scroll = this.node.getChildByName('scroll');
            scroll.width  = rollRight.x - rollLeft.x - 50;
        }
    },
    exitForNormal(){
        for(let i = 0; i < this.parList.length; ++i){
            this.parList[i].removeFromParent(true);
            this.parList[i].destroy();
        }
        let rollLeft = this.node.getChildByName('Roll_Left');
        rollLeft.x = -75;
        rollLeft.y = 15;
        rollLeft.angle = 0;
        rollLeft.opacity = 0;
        let rollRight = this.node.getChildByName('Roll_Right');
        rollRight.x = 75;
        rollRight.y = 15;
        rollRight.angle = 0;
        rollRight.opacity = 0;
        let scroll = this.node.getChildByName('scroll');
        scroll.opacity = 0;

        this.node.active = false;
    },

    exit() {
        if (this.callback && typeof this.callback == "function") {
            this.node.emit("STOP");
            this.callback();
        }
        for(let i = 0; i < this.parList.length; ++i){
            this.parList[i].removeFromParent(true);
            this.parList[i].destroy();
        }
        let rollLeft = this.node.getChildByName('Roll_Left');
        rollLeft.opacity = 0;
        let rollRight = this.node.getChildByName('Roll_Right');
        rollRight.opacity = 0;
        let scroll = this.node.getChildByName('scroll');
        scroll.opacity = 0;

        this.node.active = false;
    },
    getXPosition(index) {
        let width = this.node.config.SYMBOL_WIDTH * 1;
        return (width + this.node.config.SYMBOL_MARGIN_RIGHT) * index + width/2;
    },
});
