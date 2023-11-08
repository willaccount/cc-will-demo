const {SymbolSpineDefine} = require('SlotCustomDataType');

cc.Class({
    extends: cc.Component,

    properties: {
        spineDataList:{
            type: SymbolSpineDefine,
            default: [],
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onEnable () {
        const customEvt = new cc.Event.EventCustom('SET_UP_SPINE_DATABASE', true);
        customEvt.detail = {spineSkeletonDatabase:this};
        this.node.dispatchEvent(customEvt);
    },

    onDisable(){
        const customEvt = new cc.Event.EventCustom('SET_UP_SPINE_DATABASE', true);
        customEvt.detail = {spineSkeletonDatabase:null};
        this.node.dispatchEvent(customEvt);
    },

    getSpineSkeletonData(spineName){
        for(let i = 0; i<this.spineDataList.length; i++){
            if(this.spineDataList[i].name === spineName){
                return this.spineDataList[i].spine;
            }
        }
        return null;
    }
});
