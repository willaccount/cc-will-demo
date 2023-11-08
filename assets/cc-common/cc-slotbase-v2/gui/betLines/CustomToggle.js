
cc.Class({
    extends: cc.Toggle,

    properties: {
        checkedSprite: cc.SpriteFrame,
        unCheckedSprite: cc.SpriteFrame,
    },
    onLoad () {
        if(this.target){
            this._unCheckedTarget = this.node.children[0];
        }

        if(this.checkMark){
            this._checkedTarget = this.node.children[1];
        }
    },

    _updateCheckMark () {
        this._super();
        if(!this._unCheckedTarget){
            if(this.target){
                this._unCheckedTarget = this.node.children[0];
            }
        }

        if(!this._checkedTarget){
            if(this.checkMark){
                this._checkedTarget = this.node.children[1];
            }
        }
        this.target = this.isChecked?this._checkedTarget:this._unCheckedTarget;
        this.normalSprite = this.isChecked?this.checkedSprite:this.unCheckedSprite;
    },

    toggle () {
        if(this.isChecked) return;
        this.isChecked = !this.isChecked;
    },
    
});
