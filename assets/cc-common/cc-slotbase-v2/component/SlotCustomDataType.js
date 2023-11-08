

const SymbolSpineDefine  = cc.Class({
    name: 'SymbolSpineDefine',
    properties: {
        name: {
            default: ''
        },
        spine: {
            type: sp.SkeletonData,
            default: null,
        },
    }
});

const TutorialDataConfig  = cc.Class({
    name: 'TutorialDataConfig',
    properties: {
        currencyCode: {
            default: ''
        },
        tutorialData: {
            type: cc.Asset,
            default: null,
        },
        tutorialSteps: {
            type: cc.Asset,
            default: null,
        },
        tutorialText: {
            type: cc.Asset,
            default: null,
        },
    }
});

const InfoCurrencyConfig  = cc.Class({
    name: 'InfoCurrencyConfig',
    properties: {
        currencyCode: {
            default: ''
        },
        infos: {
            default: [],
            type: cc.SpriteFrame,
        }
    }
});

module.exports = {
    SymbolSpineDefine,
    TutorialDataConfig,
    InfoCurrencyConfig
};
