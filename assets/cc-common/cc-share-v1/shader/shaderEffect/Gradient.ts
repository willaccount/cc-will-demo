const {ccclass, property} = cc._decorator;

@ccclass
export default class Gradient extends cc.Component {

    @property(cc.Sprite)
    label: cc.Sprite = null;

    material;
    time : number = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.material = this.label.getMaterial(0);
        this.schedule(this.upd, 0, cc.macro.REPEAT_FOREVER, 1);
    }
    upd() {
        this.time += 0.005;
        this.material.effect.setProperty('time', this.time);
        if(this.time > 1.2) {
            this.unschedule(this.upd);
        }
    }

    // update (dt) {}
}
