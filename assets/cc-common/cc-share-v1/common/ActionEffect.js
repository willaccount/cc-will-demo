

const ActionEffect = {
    shake(obj, time, delay = 0) {
        const timeFrame = time / 10;
        const posX = obj.x;
        const posY = obj.y;
        let effect = cc.sequence(
            cc.spawn(cc.moveTo(timeFrame, posX - 1, posY - 2), cc.rotateTo(timeFrame, -1)), //10%
            cc.spawn(cc.moveTo(timeFrame, posX - 3, posY + 0), cc.rotateTo(timeFrame, 1)), //20%
            cc.spawn(cc.moveTo(timeFrame, posX + 3, posY + 2), cc.rotateTo(timeFrame, 0)), //30%
            cc.spawn(cc.moveTo(timeFrame, posX + 1, posY - 1), cc.rotateTo(timeFrame, 1)), //40%
            cc.spawn(cc.moveTo(timeFrame, posX - 1, posY + 2), cc.rotateTo(timeFrame, -1)), //50%
            cc.spawn(cc.moveTo(timeFrame, posX - 3, posY + 1), cc.rotateTo(timeFrame, 0)), //60%
            cc.spawn(cc.moveTo(timeFrame, posX + 3, posY + 1), cc.rotateTo(timeFrame, -1)), //70%
            cc.spawn(cc.moveTo(timeFrame, posX - 1, posY - 1), cc.rotateTo(timeFrame, 1)), //80%
            cc.spawn(cc.moveTo(timeFrame, posX + 1, posY + 2), cc.rotateTo(timeFrame, 0)), //90%
            cc.spawn(cc.moveTo(timeFrame, posX + 1, posY - 2), cc.rotateTo(timeFrame, -1)), //100%
            cc.spawn(cc.moveTo(timeFrame, posX, posY), cc.rotateTo(timeFrame, 0)), //100%
            cc.delayTime(delay),
        );
        return effect;
    },

    jelloHorizontal(obj, time, delay = 0) {
        const timeFrame = time / 10;
        let effect = cc.sequence(
            cc.scaleTo(timeFrame * 3, 1, 1), //10
            cc.scaleTo(timeFrame, 1.25, 0.75), //40
            cc.scaleTo(timeFrame, 0.75, 1.25), //50
            cc.scaleTo(timeFrame * 1.5, 1.15, 0.85), //50
            cc.scaleTo(timeFrame, 1.05, 0.95), //50
            cc.scaleTo(timeFrame * 2.5, 1, 1), //50
            cc.delayTime(delay),
        );
        return effect;
    },

    jelloVertical(obj, time, delay = 0) {
        const timeFrame = time / 10;
        let effect = cc.sequence(
            cc.scaleTo(timeFrame * 3, 1, 1), //10
            cc.scaleTo(timeFrame, 0.75, 1.25), //40
            cc.scaleTo(timeFrame, 1.25, 0.75), //50
            cc.scaleTo(timeFrame * 1.5, 0.85, 1.15), //50
            cc.scaleTo(timeFrame, 0.95, 1.05), //50
            cc.scaleTo(timeFrame * 2.5, 1, 1), //50
            cc.delayTime(delay),
        );
        return effect;
    },

    jelloDiagonal(obj, time, delay = 0) {
        const timeFrame = time / 10;
        let effect = cc.sequence(
            cc.skewTo(timeFrame * 3, 0, 0),
            cc.skewTo(timeFrame, -25, -25),
            cc.skewTo(timeFrame, -15, -15),
            cc.skewTo(timeFrame * 1.5, 5, 5),
            cc.skewTo(timeFrame, -5, -5),
            cc.skewTo(timeFrame * 2.5, 0, 0),
            cc.delayTime(delay),
        );
        return effect;
    },

    heartBeat(obj, time, delay = 0) {
        const timeFrame = time / 10;
        let effect = cc.sequence(
            cc.scaleTo(timeFrame, 1, 1),
            cc.scaleTo(timeFrame, 0.91, 0.91),
            cc.scaleTo(timeFrame * 0.7, 0.98, 0.98),
            cc.scaleTo(timeFrame * 1.6, 0.87, 0.87),
            cc.scaleTo(timeFrame * 2.2, 1, 1),
            cc.delayTime(delay),
        );
        return effect;
    },

    wobbleHorBottom(obj, time, delay = 1) {
        const timeFrame = time / 10;
        const posX = obj.x;
        const posY = obj.y;

        let effect = cc.sequence(
            cc.spawn(cc.moveTo(timeFrame * 1.5, posX - 30, posY), cc.rotateTo(timeFrame * 1.5, -6)),
            cc.spawn(cc.moveTo(timeFrame * 1.5, posX + 15, posY), cc.rotateTo(timeFrame * 1.5, 6)),
            cc.spawn(cc.moveTo(timeFrame * 1.5, posX - 15, posY), cc.rotateTo(timeFrame * 1.5, -3.6)),
            cc.spawn(cc.moveTo(timeFrame * 1.5, posX + 9, posY), cc.rotateTo(timeFrame * 1.5, 2.4)),
            cc.spawn(cc.moveTo(timeFrame * 1.5, posX - 6, posY), cc.rotateTo(timeFrame * 1.5, -1.2)),
            cc.spawn(cc.moveTo(timeFrame * 1.5, posX, posY), cc.rotateTo(timeFrame * 1.5, 0)),
            cc.delayTime(delay),
        );
        return effect;
    },

    wobbleHorTop(obj, time, delay = 1) {
        const timeFrame = time / 10;
        const posX = obj.x;
        const posY = obj.y;

        let effect = cc.sequence(
            cc.spawn(cc.moveTo(timeFrame * 1.5, posX - 30, posY), cc.rotateTo(timeFrame * 1.5, 6)),
            cc.spawn(cc.moveTo(timeFrame * 1.5, posX + 15, posY), cc.rotateTo(timeFrame * 1.5, -6)),
            cc.spawn(cc.moveTo(timeFrame * 1.5, posX - 15, posY), cc.rotateTo(timeFrame * 1.5, 3.6)),
            cc.spawn(cc.moveTo(timeFrame * 1.5, posX + 9, posY), cc.rotateTo(timeFrame * 1.5, -2.4)),
            cc.spawn(cc.moveTo(timeFrame * 1.5, posX - 6, posY), cc.rotateTo(timeFrame * 1.5, 1.2)),
            cc.spawn(cc.moveTo(timeFrame * 1.5, posX, posY), cc.rotateTo(timeFrame * 1.5, 0)),
            cc.delayTime(delay),
        );
        return effect;
    },

    swildOutFwd(obj, time, delay = 1) {

        let effect = cc.sequence(
            cc.spawn(cc.rotateTo(0, 0), cc.scaleTo(0, 1, 1), cc.fadeIn(0)),
            cc.spawn(cc.rotateTo(time, 540), cc.scaleTo(time, 5), cc.fadeOut(time)),
            cc.delayTime(delay),
        );
        return effect;
    },

    randomBenzier(obj, target, time) {
        const distanceX = Math.abs(obj.x - target.x);
        let curvePoint1 = cc.v2(Math.random() * distanceX + Math.min(target.x, obj.x), obj.y);
        let curvePoint2 = cc.v2(Math.random() * distanceX + Math.min(target.x, obj.x), target.y);
        let effect = cc.bezierTo(time, [curvePoint1, curvePoint2, target]);
        return effect;
    }
};

module.exports = ActionEffect;