/**
 * 
 * https://github.com/ShawnZhang2015/ShaderHelper/blob/master/assets/shader/FluxaySuper.js
 * 
 */

const {ccclass, property} = cc._decorator;

@ccclass
export default class FluxaySuper extends cc.Component {

    @property(cc.Sprite) sprite: cc.Sprite = null;

    material;
    _start;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

        this.material = this.sprite.getMaterial(0);
        this._start = Date.now();

    }

    update (dt) {
        const now = Date.now();
        let time = ((now - this._start) / 1000);
        this.material.setProperty('time', time);
    }
}
