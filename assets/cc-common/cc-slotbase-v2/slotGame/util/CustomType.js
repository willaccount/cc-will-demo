
const MODE_POS = cc.Class({
    name: 'MODE_POS',
    properties: {
        pos : [cc.Vec2]
    },
});

const PaylineType = cc.Enum({
    Traditional: 0,
    TwoFourThreeWays: 1,
    Others: 3,
});

const SlotDirectorType = cc.Enum(
    {
        NormalGameMode: 0,
        FreeGameMode:1,
        BonusGameMode: 2,
        Other:3,
    }
    
);
const RotatingObject = cc.Class({
    name: 'RotatingObject',

    properties: {
        node: cc.Node,
        speed: 10,
        speedVar:5,
        clockwise: 1,
        minAngle: 0,
        maxAngle: 10,
    },
});

const DistanceType = cc.Enum({
    Near: 0,
    Middle: 1,
    Far: 2,
    VeryFar: 3,
});

const FlyingLanternConfig = cc.Class({
    name: 'FlyingLanternConfig',
    properties: {
        distanceType: {
            type: DistanceType,
            default: DistanceType.Near,
        },
        maxQuantity: 5,
        scale: 1,
        opacity: 255,
        minSpeedY: 0.1,
        maxSpeedY: 10,
        minSpeedX: -2,
        maxSpeedX: 2,
        animationClip: "",
    },

    getRandomSpeedY(){
        return Math.random()*(this.maxSpeedY-this.minSpeedY) + this.minSpeedY;
    },

    getRandomSpeedX(){
        return Math.random()*(this.maxSpeedX - this.minSpeedX) + this.minSpeedX;
    },

});

const SpineAnimationInfo = cc.Class({
    name: 'SpineAnimationInfo',

    properties: {
        name: '',
        track: 0,
    },
});

const UnicornState = cc.Enum(
    {
        LANTERN_OFF: 0,
        LANTERN_ON: 1,
        GOLD_REEL: 2,
        LAST_CHANCE: 3,
        IDLE_GOLD_REEL: 4,
        IDLE_LAST_CHANCE: 5,
        

        UNDEFINED: 9,
    }
    
);

const BonusItemInfo = cc.Class({
    name: 'BonusItemInfo',
    properties: {
        name: '',
        sprite: cc.SpriteFrame,
        spines: sp.Skeleton
    }
});
const BoardGameNode = cc.Class({
    name: 'BoardGameNode',
    properties: {
        id: '',
        name: '',
        icon: cc.SpriteFrame,
        gameNode: cc.Prefab,
    }
});
module.exports = {
    PaylineType,
    SlotDirectorType,
    RotatingObject,
    FlyingLanternConfig,
    SpineAnimationInfo,
    UnicornState,
    BonusItemInfo,
    BoardGameNode,
    MODE_POS
};