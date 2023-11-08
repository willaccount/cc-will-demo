

const {changeParent} = require("utils");
const {formatMoney} = require('utils');

const STATE = cc.Enum({
    INIT: 0,
    STARTSPIN: 1,
    SPEEDUP:2,
    SPINNING: 3,
    SPEEDDOWN: 4,
    ONSTOP: 5,
    SETRESULT: 6,
    STOPPED: 7,
    GOTRESULT: 8,
    RANDOM_PU: 9,
});

const STOPEFFECT = cc.Enum({
    NONE: 0,
    NEAR_WIN_TOP: 1,
    NEAR_MISS_TOP: 2,
    NEAR_WIN_BOT: 3,
    NEAR_MISS_BOT: 4,
});

cc.Class({
    extends: cc.Component,

    properties: {
        display: cc.Node,
        static: cc.Node,
        anim: sp.Skeleton,
        text: cc.Label,
        align: cc.Widget,
    },

    onLoad()
    {
        this.maskParent = this.node.parent;
        this.sprite = this.display.getComponentInChildren(cc.Sprite);
    },

    init(config)
    {
        //TODO move in to config
        this.startSpeed = config.startSpeed; //1200,
        this.acceleration = config.acceleration;//: 600,
        this.maxSpeed = config.maxSpeed;//: 1200,
        this.speedToStop = config.speedToStop;//: 600,       
        this.symbolList = config.symbolList; //[cc.SpriteFrame],
        this.stopOffset = config.stopOffset;//: 30,
        this.tableSpeed = config.tableSpeed;
        this.powerUpSprite = config.powerUpSprite;
        this.powerUpSymbol = config.powerUpSymbol;
        this.upgradeSprite = config.upgradeSprite;
        this.speedToStopWithEffect = config.speedToStopWithEffect;
        this.applyColorMask(config.matrixLevel);
    },

    start()
    {
        this.cachedPosition = this.node.position;
        this.display.y = this.node.config.SYMBOL_HEIGHT;
        this.display.opacity = 255;
        this.scrollOffset = this.node.config.SYMBOL_HEIGHT;
        this.state = STATE.INIT;
        this.currentSpeed = this.startSpeed;
        this.stopSpinPosY = 0;
    },

    randomTexture(list, forceDiff = false)
    {
        let symbolNameList = Object.keys(list);
        let sprite = list[symbolNameList[Math.floor(Math.random()*symbolNameList.length)]];
        while (forceDiff && (!sprite || (this.sprite.spriteFrame && sprite.name == this.sprite.spriteFrame.name)))
            sprite = list[symbolNameList[Math.floor(Math.random()*symbolNameList.length)]];
        this.setSprite(sprite);
    },

    setSprite(spriteFrame)
    {
        this.sprite.spriteFrame = spriteFrame;
        this.align.updateAlignment();
    },

    setState(state)
    {
        this.state = state;
    },

    setIndex(index)
    {
        this.index = index;
    },

    getIndex()
    {
        return this.index;
    },

    startSpin(delay=0)
    {
        if (this.state != STATE.GOTRESULT)
        {
            this.movingOffsetY = 0;
            this.revolveExtentCount = 0;
            this.randomTexture(this.symbolList);
            this.setState(STATE.STARTSPIN);
            this.node.runAction(cc.sequence(cc.delayTime(delay), /*cc.moveBy(0.2, 0, 25), cc.moveBy(0.1, 0, -25),*/ cc.callFunc(()=>{
                this.setState(STATE.SPEEDUP);
                this.result = null;
            })));
            return 1;
        }
        return 0;
    },

    setParentNode(mask, unmask)
    {
        this.maskParent = mask;
        this.unmaskParent = unmask;
    },

    stopSpin(symbol, delay=0, effect=0)
    {
        if (this.state != STATE.GOTRESULT)
        {
            this.revolveExtentCount = 0;
            this.node.runAction(cc.sequence(cc.delayTime(delay), cc.callFunc(()=>{
                this.result = symbol;
                this.stopEffect = effect;
                if (this.result && this.result != 0 && this.stopEffect == STOPEFFECT.NEAR_WIN_TOP)
                {
                    this.stopEffect = STOPEFFECT.NEAR_MISS_TOP;
                }
                    
                if (!this.result && this.stopEffect == STOPEFFECT.NEAR_MISS_TOP)
                {
                    this.stopEffect = STOPEFFECT.NEAR_WIN_TOP;
                }
            })));
        }
    },

    revolve()
    {
        if (this.state == STATE.SETRESULT || this.state == STATE.ONSTOP)
        {
            this.setState(STATE.ONSTOP);
            if (this.powerUpSymbol.indexOf(this.result) >= 0)
            {
                this.setSprite(this.symbolList['o']);
                this.display.y = this.node.config.SYMBOL_HEIGHT;
                this.scrollOffset = this.node.config.SYMBOL_HEIGHT;
                this.stopSpinPosY = 0;
            }
            else
            if (this.symbolList[this.result])
            {
                this.setSprite(this.symbolList[this.result]);
                this.display.y = this.node.config.SYMBOL_HEIGHT;
                this.scrollOffset = this.node.config.SYMBOL_HEIGHT;
                this.stopSpinPosY = 0;
            }
            else
            {
                if (this.result != 0)
                    cc.error("Can't find symbol, should recheck symbol list" + this.result);
                    
                this.randomTexture(this.symbolList);
                this.display.y = this.node.config.SYMBOL_HEIGHT * 2;
                this.scrollOffset = this.node.config.SYMBOL_HEIGHT * 2;
                this.stopSpinPosY = this.node.config.SYMBOL_HEIGHT;
            }
            if (this.stopEffect)
            {
                this.currentSpeed = 30;
                this.scrollOffset = this.node.config.SYMBOL_HEIGHT;
            }
            this.addOffsetForEffect();
        }
        else
        {
            if (this.result)
            {
                this.revolveExtentCount += 1;
            }
            this.randomTexture(this.symbolList);
            this.display.y = this.node.config.SYMBOL_HEIGHT;
            this.scrollOffset = this.node.config.SYMBOL_HEIGHT;
        }
    },

    addOffsetForEffect()
    {
        switch (parseInt(this.stopEffect))
        {
            case STOPEFFECT.NEAR_WIN_TOP:
                {
                    this.stopSpinPosY -= this.node.config.SYMBOL_HEIGHT/2;
                }
                break;
            case (STOPEFFECT.NEAR_MISS_TOP):
                {
                    this.stopSpinPosY += this.node.config.SYMBOL_HEIGHT/2;
                }
                break;
            case (STOPEFFECT.NEAR_MISS_BOT):
                {
                    this.stopSpinPosY += (this.node.config.SYMBOL_HEIGHT)*1.5;
                }
                break;
        }
    },

    update(dt)
    {
        dt = dt*this.tableSpeed;
        switch (this.state)
        {
            case STATE.SPEEDUP:
                if (this.currentSpeed < this.maxSpeed)
                {
                    this.currentSpeed += this.acceleration * dt;
                }
                else
                {
                    this.setState(STATE.SPINNING);
                }
                break;

            case STATE.SPINNING:
                if (this.result != null)
                {
                    if (this.stopEffect == STOPEFFECT.NONE || this.revolveExtentCount >= 5)
                        this.setState(STATE.SPEEDDOWN);
                }
                break;

            case STATE.SPEEDDOWN:
                if ((this.stopEffect == STOPEFFECT.NONE) && (this.currentSpeed > this.speedToStop))
                {
                    this.currentSpeed -= this.acceleration * dt;
                }
                else if ((this.stopEffect != STOPEFFECT.NONE) && (this.currentSpeed > this.speedToStopWithEffect))
                {
                    this.currentSpeed -= 150 * dt;
                }
                else
                {
                    this.setState(STATE.SETRESULT);
                }
                break;
            case STATE.ONSTOP:
                {
                    if (this.display.y <= this.stopSpinPosY)
                    {
                        this.setState(STATE.STOPPED);
                        this.movingOffsetY = this.stopSpinPosY - this.display.y;
                        //this.display.y = this.stopSpinPosY;
                        this.scrollOffset = this.stopSpinPosY;
                        this.onFinishSpin();
                    }
                }
                break;
            case STATE.RANDOM_PU:
                break;
        }

        if (this.state > STATE.STARTSPIN && this.state < STATE.STOPPED)
        {
            this.scrollOffset -= this.currentSpeed * dt;
            this.display.y = this.scrollOffset;
            if (this.display.y <= -this.node.config.SYMBOL_HEIGHT)
            {
                this.revolve();
            }
        }
    },

    runEffectEnd()
    {
        const effectTime = 0.08;
        const delayEffect = 0.2;
        if (this.stopEffect == STOPEFFECT.NEAR_WIN_TOP)
        {
            this.display.runAction(cc.sequence(cc.delayTime(delayEffect),
                cc.moveTo(effectTime, this.display.x, this.stopSpinPosY + this.node.config.SYMBOL_HEIGHT/2),
                cc.callFunc(()=>{
                    this.unMaskSymbol();
                    this.onSymbolFinishSpin();
                }))/*.easing(cc.easeBounceInOut(effectTime)
                )*/);
        }
        if (this.stopEffect == STOPEFFECT.NEAR_MISS_TOP)
        {
            this.display.runAction(cc.sequence(cc.delayTime(delayEffect),
                cc.moveTo(effectTime, this.display.x, this.stopSpinPosY - this.node.config.SYMBOL_HEIGHT/2),
                cc.callFunc(()=>{
                    this.unMaskSymbol();
                    this.onSymbolFinishSpin();
                }))/*.easing(cc.easeBounceInOut(effectTime)
                )*/);
        }
    },

    setSpeed(speed)
    {
        this.tableSpeed = speed;
    },

    unMaskSymbol()
    {
        if (this.result && this.result != 0)
        {
            //changeParent(this.node, this.unmaskParent);
            let cachedPosition = this.node.position;
            this.node.setParent(this.unmaskParent);
            this.node.setPosition(cachedPosition);
        }
    },

    fillSymbol(symbol, delay = 0, callback = null)
    {
        if (symbol && symbol != "0")
        {
            this.setState(STATE.GOTRESULT);
            let spriteFrame = "";
            if (this.symbolList[symbol])
            {
                //play effect set sprite here
                spriteFrame = this.symbolList[symbol];
            }
            else if (this.powerUpSprite[symbol])
            {
                spriteFrame = this.powerUpSprite[symbol];
            }
            else if (this.upgradeSprite[symbol])
            {
                spriteFrame = this.upgradeSprite[symbol];
            }
            this.node.runAction(cc.sequence(cc.delayTime(delay), cc.callFunc(()=>{
                this.result = symbol;
                this.setSprite(spriteFrame);
                this.display.y = 0;
                this.unMaskSymbol();
                //this.onSymbolFinishSpin(false);
                if (symbol == "2") {
                    this.playAnimation();
                }
                callback && callback();
            })));
        }
    },

    onFinishSpin()
    {
        if (this.stopEffect)
        {
            this.runEffectEnd();
        }
        else
        {
            this.display.runAction(cc.sequence(cc.moveBy(0.2, 0, -this.stopOffset),
                cc.moveBy(0.2, 0, this.stopOffset + this.movingOffsetY),
                //cc.moveBy(0.03, 0, 10),
                cc.callFunc(()=>{
                    this.unMaskSymbol();
                }),
                cc.callFunc(()=>{
                    this.onSymbolFinishSpin();
                })));
        }
        if (this.result && this.result != 0)
        {
            this.setState(STATE.GOTRESULT);
        }
        this.currentSpeed = this.startSpeed;
    },

    changeSpriteRandomMode()
    {
        this.randomTexture(this.powerUpSprite, true); 
    },

    onFinishRandomSprite()
    {
        this.setSprite(this.powerUpSprite[this.powerUpSpinResult]);
        this.powerUpSpinResult = 0;
        this.powerUpSpinFinishCb && this.powerUpSpinFinishCb();
        this.setState(STATE.STOPPED);
    },
    
    spinPowerUp()
    {
        //TODO: move it to config
        this.display.active = false;
        this.randomTimeFrame = 0.5;
        this.randomTimeCount = this.randomTimeFrame;
        this.randomRunTime = 10;
        this.setState(STATE.RANDOM_PU);
    },

    stopSpinPowerUp(result, callback)
    {
        this.display.active = true;
        this.fillSymbol(result);
        this.display.runAction(cc.sequence(cc.scaleTo(0.2, 1.3), cc.delayTime(0.5), cc.scaleTo(0.2, 1), cc.callFunc(()=>{
            callback && callback();
        })));
    },

    getCurrentResult()
    {
        return this.result || 0;
    },

    getPosition()
    {
        return this.node.parent.convertToWorldSpaceAR(this.node.position);
    },

    reset()
    {
        this.level = 0;
        this.static.active = true;
        this.display.active = true;
        this.anim.node.active = false;
        this.text.node.active = false;
        this.setState(STATE.INIT);
        this.display.y = this.node.config.SYMBOL_HEIGHT;
        this.scrollOffset = this.node.config.SYMBOL_HEIGHT;
        this.currentSpeed = this.startSpeed;
        this.stopSpinPosY = 0;
        changeParent(this.node, this.maskParent);
        this.node.setPosition(this.cachedPosition);
    },

    //starwar only
    setKyloSymbol(sprite)
    {
        this.symbolList["2"] = sprite;
    },

    displayBonus(data)
    {
        this.setSprite(this.upgradeSprite["PU44"]);
        this.display.y = 0;
        this.text.string = formatMoney(data.winAmount);
        this.text.node.active = true;
    },

    playEffectFillIn()
    {
        this.node.dispatchEvent( new cc.Event.EventCustom('PLAY_EXPLORE_EFFECT', true) );
        this.playAnimation();
    },

    playEffectFlyFrom(position)
    {
        let target = cc.v3(0,0,0);
        this.display.position = this.display.parent.convertToNodeSpaceAR(position);

        cc.tween(this.display)
            .to(0.8, { position: target, opacity: 255})
            .call(()=>{
                this.node.dispatchEvent( new cc.Event.EventCustom('PLAY_EXPLORE_EFFECT', true) );
                this.playAnimation();
            })
            .start();
    },

    onSymbolFinishSpin(playAnimFinish = true)
    {
        const evt = new cc.Event.EventCustom('CELL_STOP', true);
        evt.detail = {symbol: this.result};
        this.node.dispatchEvent( evt );
        if (this.result == "2" && playAnimFinish)
        {
            this.playAnimation();
        }
    },

    hide()
    {
        this.display.active = false;
    },

    playAnimation()
    {
        this.static.active = false;
        this.anim.node.active = true;
        this.anim.setAnimation(0, "Effect");
        this.anim.addAnimation(0, "Frame1", true);
    },

    applyColorMask(level) {
        if(level == 0) {
            this.color_mask = cc.v4(1.0, 1.0, 1.0, 0.0);
        } else if(level == 1) {
            this.color_mask = cc.v4(1.0, 0.196, 0.196, 1.0);
        } else {
            this.color_mask = cc.v4(0.9, 0.1372, 1.0, 1.0);           
        }
        if(this.anim.getComponent(sp.Skeleton)) {
            this.anim.getComponent(sp.Skeleton).getMaterial(0).setProperty('color_mask', this.color_mask);
        }
        this.level = level;
    }
});
