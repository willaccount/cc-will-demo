const { ccclass, property } = cc._decorator;

@ccclass
export class UpdatePanel extends cc.Component {

    @property(cc.Label)
    info: cc.Label = null!;

    @property(cc.ProgressBar)
    byteProgress: cc.ProgressBar = null!;
};