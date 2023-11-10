
cc.Class({
    extends: require('CutsceneMode'),

    properties: {
        particleNode: cc.Node,
        tableNormal: cc.Node,
        destPosNormal: cc.Node,
        tableFree: cc.Node,
        destPosFree: cc.Node,
    },
    enter() {
        const {matrix,isNormal} = this.content;
        this.isNormal = isNormal;
        this.tableFormat = this.node.config.TABLE_FORMAT;
        this.table = this.tableNormal;
        this.tableFree.active = false;
        this.tableNormal.active = true;
        this.destPos = this.destPosNormal;
        if(!isNormal) {
            this.tableFormat = this.node.config.TABLE_FORMAT_FREE;
            this.table = this.tableFree;
            this.destPos = this.destPosFree;
            this.tableFree.active = true;
            this.tableNormal.active = false;
        }
        this.parList = [];
        let scatCoorList = [];
        for(let i = 0; i < matrix.length; ++i){
            for(let j = 0 ; j < matrix[i].length; ++j){
                if(matrix[i][j] === 'K'){
                    scatCoorList.push(cc.v2(i,j));
                }
            }
        }
        this.playAnim(scatCoorList);
        this.isShowing = true;
    },

    playAnim(arrCoor){
        if (this.node.soundPlayer) this.node.soundPlayer.playParticleMultiplier();
        for(let i = 0; i < arrCoor.length; ++i){
            let particle = cc.instantiate(this.particleNode);
            particle.parent = this.table;
            particle.active = true;
            particle.x = this.getXPosition(arrCoor[i].x);
            particle.y =  (this.tableFormat[arrCoor[i].x]  - arrCoor[i].y)*this.node.config.SYMBOL_HEIGHT - this.node.config.SYMBOL_HEIGHT/2;
            this.parList.push(particle);
            cc.tween(particle)
                .to(0.5, {x: this.destPos.x, y: this.destPos.y})
                .call(()=>{
                    this.exit();
                })
                .start();
        }
    },

    skip() {
        if (!this.isShowing) return;
        this.exit(true);
    },
  
    exit(isForce = false) {
        this.callback && this.callback(isForce);
        this.isShowing = false;
        for(let i = 0; i < this.parList.length; ++i){
            this.parList[i].stopAllActions();
            this.parList[i].removeFromParent(true);
            this.parList[i].destroy();
        }
        this.node.active = false;
    },
    getXPosition(index) {
        let width = this.node.config.SYMBOL_WIDTH;
        return (width + this.node.config.SYMBOL_MARGIN_RIGHT) * index + width/2;
    },
});
