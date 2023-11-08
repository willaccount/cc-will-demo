

const TweenShaking = function (node, dur, repeat){
    let tween = cc.tween(node);
    if(repeat === -1){
        tween.repeatForever(
            cc.tween()
                .by(dur, {position: cc.v2(-10, 0)})
                .by(dur, {position: cc.v2(10, 0)})
                .by(dur, {position: cc.v2(10, 0)})
                .by(dur, {position: cc.v2(-10, 0)})
        );
    }
    
    return tween;
};

const lightBlinking = function (node,{minOpacity = 100, maxOpacity = 255, dur = 0.02} ){
    node.runAction(cc.repeatForever(
        cc.sequence(
            cc.fadeTo(dur,minOpacity),
            cc.fadeTo(dur,maxOpacity),
        )
    ));
};

module.exports = {
    TweenShaking,
    lightBlinking
};