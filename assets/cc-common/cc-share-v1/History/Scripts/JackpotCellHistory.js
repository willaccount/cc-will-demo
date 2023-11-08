const { jackpotStatic } = require('CustomDataType');

cc.Class({
    extends: require("BaseCellHistory"),

    properties: {
        jackpotType: cc.Node,
        jackpotList: {
            default: [],
            type: [jackpotStatic]
        },
        height: 50
    },

    onLoad() {
        this._super();
        this.node.height = this.height;
    },

    updateData(data) {
        this._super(data);
        if(this.jackpotType){
            const imageJP = this.findJackpotStaticData(data.jpType);
            if (imageJP) {
                this.jackpotType.getComponent(cc.Sprite).spriteFrame = imageJP.static;
            }
        }

    },
    findJackpotStaticData(jackpotType) {
        for (let i = 0; i < this.jackpotList.length; i++) {
            if (this.jackpotList[i].name == jackpotType)
                return this.jackpotList[i];
        }
        return null;
    },
});
