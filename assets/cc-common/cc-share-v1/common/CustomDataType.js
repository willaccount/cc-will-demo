

const jackpotStatic = cc.Class({
    name: 'jackpotStatic',
    properties: {
        name: {
            default: ''
        },
        static: {
            type: cc.SpriteFrame,
            default: null,
        },
    }
});

const BettingChipMapping = cc.Class({
    name: 'BettingChip',
    properties: {
        value: 500,
        static: {
            type: cc.SpriteFrame,
            default: null,
        },
    }
});

const DynamicSpine = cc.Class({
    name: 'DynamicSpineData',
    properties: {
        name: {
            default: ''
        },
        texture: {
            type: cc.Texture2D,
            default: null,
        },
        atlas: {
            type: cc.Asset,
            default: null,
        },
        jsonFileName: {
            default: ''
        }
    }
});

const ButtonAsset = cc.Class({
    name: 'ButtonAsset',
    properties: {
        name: {
            default: ''
        },
        normalSprite: {
            type: cc.SpriteFrame,
            default: null,
        },
        pressedSprite: {
            type: cc.SpriteFrame,
            default: null,
        },
        hoverSprite: {
            type: cc.SpriteFrame,
            default: null,
        },
        disabledSprite: {
            type: cc.SpriteFrame,
            default: null,
        },
    }
});

module.exports = {
    jackpotStatic,
    BettingChipMapping,
    DynamicSpine,
    ButtonAsset
};
