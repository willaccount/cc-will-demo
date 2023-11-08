

// Animate popup effect
cc.Class({
    extends: cc.Component,

    properties: 
    {
        minSize:
        {
            default             :               0.0,
        },
        normalSize:
        {
            default             :               0.0,
        },
        maxSize:
        {
            default             :               0.0,
        },

        scaleUpTime:
        {
            default             :               0.25,
        },
        scaleDownTime:
        {
            default             :               0.25,
        },
        scaleNormalTime:
        {
            default             :               0.25,
        },
        isRunOnEnable:
        {
            default             :               false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () 
    {
        if (this.isRunOnEnable)
            return;
        this.runAnimation();
    },

    onEnable()
    {
        if (this.isRunOnEnable)
            this.runAnimation();
    },

    runAnimation()
    {
        var actionScaleUp = cc.scaleTo(this.scaleUpTime, this.maxSize);
        var actionScaleDown = cc.scaleTo(this.scaleDownTime, this.minSize);
        var actionScaleToNormalSize = cc.scaleTo(this.scaleNormalTime, this.normalSize);
        var sequenceAction = cc.sequence(actionScaleUp, actionScaleDown, actionScaleToNormalSize);
        this.node.runAction(sequenceAction);
    },
});
