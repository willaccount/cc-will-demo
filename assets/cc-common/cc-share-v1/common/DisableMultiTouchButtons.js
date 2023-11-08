
cc.Class({
    extends: cc.Component,

    properties: {
        buttons: [cc.Button],
        delayToEnable: 0.5,
    },

    onLoad () {
        for(let i = 0; i < this.buttons.length; i++)
        {
            let button = this.buttons[i];
            if(button){
                button.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStarted, this);
                button.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this);
                button.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
                button.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCanceled, this);
            }
        }
    },

    onTouchStarted(event){
        const {target} = event;
        if(target){
            const btn = target.getComponent(cc.Button);
            if(btn && btn.interactable 
                && !this.node.gSlotDataStore.isAutoSpin 
                && this.node.gSlotDataStore.playSession.isFinished !== false)
            {
                this.disableOtherButtons(target);
            }
        } 
    },

    onTouchEnded(event){    
        const {target} = event;
        if(target){
            const btn = target.getComponent(cc.Button);
            if(btn && btn.interactable 
                && !this.node.gSlotDataStore.isAutoSpin 
                && this.node.gSlotDataStore.playSession.isFinished !== false)
            {
                this.enableOtherButtons(target, this.delayToEnable);
            }
        }
    },

    onTouchMoved(){
        //todo
    },

    onTouchCanceled(event){
        const {target} = event;
        if(target){
            const btn = target.getComponent(cc.Button);
            if(btn && btn.interactable 
                && !this.node.gSlotDataStore.isAutoSpin 
                && this.node.gSlotDataStore.playSession.isFinished !== false)
            {
                this.enableOtherButtons(target);
            }
        }
    },

    disableOtherButtons(target){
        for(let i = 0; i<this.buttons.length; i++){
            const button = this.buttons[i];
            if(button && button.node !== target){
                button.interactable = false;
            }
        }
    },

    enableOtherButtons(target, delay = 0){
        this.scheduleOnce(()=>{
            for(let i = 0; i<this.buttons.length; i++){
                const button = this.buttons[i];
                if(button && button.node !== target){
                    button.interactable = true;
                }
            }
        }, delay);
    }

});
