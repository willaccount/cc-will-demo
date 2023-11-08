

const tweenLooping = (target, param) => {
    let startActionListArr = [];
    let endActionListArr = [];
    let sequenceActionArr = [];
    let actionArr = [];
    const dur = param.dur == undefined ? .5 : param.dur;
    const easing = param.easing == undefined ? cc.easeSineInOut() : param.easing;

    //opacity
    if (param.opacity !== undefined) {
        startActionListArr.push(
            cc.fadeTo(dur, param.opacity.to).easing(easing)
        );
        endActionListArr.push(
            cc.fadeTo(dur, param.opacity.from).easing(easing)
        );
    }

    //scale
    if (param.scale !== undefined) {
        startActionListArr.push(
            cc.scaleTo(dur, param.scale.to).easing(easing)
        );
        endActionListArr.push(
            cc.scaleTo(dur, param.scale.from).easing(easing)
        );
    }

    //start
    if (startActionListArr.length >= 2) {
        actionArr[0] = cc.spawn(startActionListArr);
    } else {
        if (startActionListArr.length >= 1) {
            actionArr[0] = startActionListArr[0];
        }
    }

    //end
    if (endActionListArr.length >= 2) {
        actionArr[1] = cc.spawn(endActionListArr);
    } else {
        if (endActionListArr.length >= 1) {
            actionArr[1] = endActionListArr[0];
        }
    }

    //
    if (actionArr.length >0) {
        const sequenceFading = cc.sequence(
            actionArr[0],
            actionArr[1]
        ).repeatForever();
        sequenceActionArr.push(sequenceFading);
    }

    //
    const sequenceLooping = cc.sequence(
        new cc.DelayTime(.00001),
        new cc.CallFunc(() => {
            //rotation
            if (param.rota != undefined) {
                target.angle += param.rota;
            }

            //randomSC
            if (param.randomSC != undefined) {
                target.scaleX = target.scaleY = target.initSC + (Math.random() - Math.random()) * param.randomSC;
            }
        })
    ).repeatForever();
    sequenceActionArr.push(sequenceLooping);
    
    //run all actions;
    for (let i = 0; i < sequenceActionArr.length; i++){
        target.runAction(sequenceActionArr[i]);
    }
};


const tweenVolume = (interval, soundID, volume, dur, callback) => {

    let curVolume = cc.audioEngine.getVolume(soundID);
    clearInterval(interval);
    const BGInterval = setInterval(() => {
        curVolume += (volume - curVolume) / (dur*100);
        checkToEndTween(curVolume, volume);
        cc.audioEngine.setVolume(soundID, curVolume);
    }, 60 / 100);  

    //check to end this tween.
    const checkToEndTween = (curValue, endValue) => {
        const checkValue = Math.floor(Math.abs(curValue - (endValue + 0.001)));
        if (checkValue <= .1) {
            curValue = endValue;
            clearInterval(BGInterval);
            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    };
    
    return BGInterval;
};

const tweenSizeOfObject = (object, param, callback) => {
    let curW = object.width;
    let curH = object.height;
    const finalWidth = param.width;
    const finalHeight = param.height;
    const dur = param.dur != undefined ? param.dur * 100 : 50;
    const delay = param.delay != undefined ? param.delay : 0;
    
    clearInterval(object.interval);
    object.stopAllActions();
    object.runAction(cc.sequence(
        cc.delayTime(delay),
        cc.callFunc(() => {
            enterframe();
        })
    ));

    //end every time
    const enterframe = () => {
        object.interval = setInterval(() => {
            //width
            if (finalWidth != undefined) {
                curW += (finalWidth - curW) / dur;
                object.width = curW;
                checkToEndTween(curW, finalWidth);
            }

            //height
            if (finalHeight != undefined) {
                curH += (finalHeight - curH) / dur;
                object.height = curH;
                checkToEndTween(curH, finalHeight);
            }
        }, 60 / 100);
    };

    //check to end this tween.
    const checkToEndTween = (curValue,endValue) => {
        const checkValue = Math.floor(Math.abs(curValue - (endValue + 0.001)));
        if (checkValue <= .1) {
            curValue = endValue;
            clearInterval(object.interval);
            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    };
};


const tweenObject = (target, param) => {
    const delay = param.delay == undefined ? 0 : param.delay;
    const dur = param.dur == undefined ? .5 : param.dur;
    const easing = param.easing == undefined ? cc.easeSineOut() : param.easing;

    let actionListArr = [];
    let action = null;
    const dx = param.dx == undefined ? target.x : param.dx;
    const dy = param.dy == undefined ? target.y : param.dy;

    //position
    if (param.dx !== undefined || param.dy !== undefined) {
        actionListArr.push(cc.moveTo(dur, cc.v2(dx, dy)).easing(easing));
    }

    //scale
    if (param.scale !== undefined) {
        actionListArr.push(cc.scaleTo(dur, param.scale).easing(easing));
    }

    //scaleX
    if (param.scaleX !== undefined) {
        actionListArr.push(cc.scaleTo(dur, param.scaleX, target.scaleY).easing(easing));
    }

    //scaleY
    if (param.scaleY !== undefined) {
        actionListArr.push(cc.scaleTo(dur, target.scaleX, param.scaleY).easing(easing));
    }

    //skewTo
    if (param.skew !== undefined) {
        actionListArr.push(cc.skewTo(dur, param.skew, param.skew).easing(easing));
    }

    //rotation
    if (param.rotate !== undefined) {
        actionListArr.push(cc.rotateTo(dur, param.rotate).easing(easing));
    }

    //opacity
    if (param.opacity !== undefined) {
        actionListArr.push(cc.fadeTo(dur, param.opacity).easing(easing));
    }

    if (actionListArr.length >= 2) {
        action = cc.spawn(actionListArr);
    } else {
        action = actionListArr[0];
    }

    const delayTime = cc.delayTime(delay);
    const callFunc = cc.callFunc(() => {
        if (param.callback && typeof param.callback === 'function') {
            param.callback();
        }
    });

    const sequenceAction = cc.sequence(delayTime, action, callFunc);
    target.runAction(sequenceAction);
};

const showScoreOnScreen = (parentNode, scoreNodePrefab, param) => {
    const scoreNode = cc.instantiate(scoreNodePrefab);
    const delay = param.delay !== undefined ? param.delay : 0;
    const dur = param.dur !== undefined ? param.dur : .5;
    const limitedX = param.limitedX !== undefined ? param.limitedX : 100;
    const limitedY = param.limitedY !== undefined ? param.limitedY : 300;
    const maxSC = param.maxSC !== undefined ? param.maxSC : scoreNode.scale + 1;
    const endSC = param.endSC !== undefined ? param.endSC : scoreNode.scale / 2;
    const startX = param.startX;
    const startY = param.startY;
    const endX = param.endX;
    const endY = param.endY;
    let midX = startX + (endX - startX) / 3;
    let midY = startY - (endY - startY) / 3;

    //limited distance
    if (midX > startX + limitedX) {
        midX = startX + limitedX;
    }

    if (midY > startY + limitedY) {
        midY = startY + limitedY;
    }

    scoreNode.getChildByName("score").getComponent(cc.Label).string = param.score;
    scoreNode.x = startX;
    scoreNode.y = startY;
    scoreNode.parent = parentNode;

    tweenObject(scoreNode, {"dur": dur / 4, "delay": delay, "dx": midX, "dy": midY, "scale": maxSC, "easing": new cc.easeSineOut(), "callback": () => {
        tweenObject(scoreNode, { "dur": dur, "delay": .2, "dx": endX, "dy": endY, "scale": endSC, "easing": new cc.easeSineInOut() });
        tweenObject(scoreNode, {"dur": dur, "delay": dur / 1.5, "opacity": 0, "easing": new cc.easeSineInOut(), "callback": () => {
            scoreNode.destroy();
            if (param.callback && typeof param.callback === 'function') {
                param.callback();
            }
        }});
    }});
};

const tweenVolumeV2 = node => (lastAction, soundId, volume, dur, callback) => {
    if (lastAction) node.stopAction(lastAction);

    let currentVolume = cc.audioEngine.getVolume(soundId);
    const interval = 100; // 100ms
    const repeatTimes = Math.floor(dur*1000 / interval);
    const volumeDelta = (volume - currentVolume) / repeatTimes;

    const updateVolume = cc.sequence(
        cc.callFunc(() => {
            currentVolume += volumeDelta;
            cc.audioEngine.setVolume(soundId, currentVolume);
        }),
        cc.delayTime(interval/1000),
    );

    const action = cc.sequence(
        cc.repeat(updateVolume, repeatTimes-1),
        cc.callFunc(() => {
            cc.audioEngine.setVolume(soundId, volume);
            if (callback && typeof callback === 'function') {
                callback();
            }
        }),
    );
    node.runAction(action);
    return action;
};

const reverseEasing = easing => t => 1 - easing(1-t);

module.exports = {
    tweenLooping,
    tweenVolume,
    tweenObject,
    tweenSizeOfObject,
    showScoreOnScreen,
    tweenVolumeV2,
    reverseEasing,
};
