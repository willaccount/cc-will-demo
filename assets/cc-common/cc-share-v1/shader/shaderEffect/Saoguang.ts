
// port from https://blog.csdn.net/huadudududud/article/details/88631355

const {ccclass, property} = cc._decorator;

@ccclass
export default class Saoguang extends cc.Component {

    @property(cc.Sprite) sprite: cc.Sprite = null;

    material;
    time : number = 0;
    _time : number = 0;
    _sin : number = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._time = 0;
        this._sin = 0;
    }

    start () {
        this.material = this.sprite.getMaterial(0);
    }
    update (dt) {
        if(this.material != null) {
            this._time += 0.5 * dt;
            this._sin = Math.sin(this._time);
            if (this._sin > 0.99) {
                this._sin = 0;
                this._time = 0;
            }
            this.material.effect.setProperty('sys_time', this._sin);
        }
    }
}
