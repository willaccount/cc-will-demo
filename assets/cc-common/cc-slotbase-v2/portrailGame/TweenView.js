
const TweenType = cc.Enum({
    FADE: 0,
    MOVE: 1,
    ZOOM: 2,
    ROTATE: 3,

    FADE_AND_MOVE: 4,
    FADE_AND_ZOOM: 5,
    FADE_AND_ROTATE: 6,
    
    MOVE_AND_ZOOM: 7,
    MOVE_AND_ROTATE:8,

    ROTATE_AND_ZOOM: 9,

    FADE_AND_MOVE_AND_ZOOM: 10,
    FADE_AND_MOVE_AND_ROTATE: 11,
    FADE_AND_ROTATE_AND_ZOOM: 12,

    MOVE_AND_ZOOM_AND_ROTATE: 13,

    FADE_AND_MOVE_AND_ZOOM_AND_ROTATE: 14,

    OTHER: 99,
});

const TweenViewConfig = cc.Class({
    name: 'TweenViewConfig',

    properties: {
        fromOpacity: 0, 
        toOpacity: 255,
        fadeDuration: 1,
        fadeEasing: "sineIn",

        fromPos: cc.v2(0,0),
        toPos: cc.v2(0,0),
        moveDuration: 1,
        moveEasing: "sineIn",

        fromScale: 1,
        toScale: 2,
        scaleDuration: 1,
        scaleEasing: "sineIn",

        fromAngle: 0,
        toAngle:180,
        rotateDuration: 1,
        rotateEasing: "sineIn",
    },
});

cc.Class({
    extends: cc.Component,

    properties: {
        tweenType: {
            type: TweenType,
            default: TweenType.FADE,
        },

        tweenViewConfig:{
            type: TweenViewConfig,
            default: null,
        },
        delayStart: 0,
        forceChildrend: false,
        stopPreviousTween: true,
    },

    onLoad() {
        this.node.show = this.show.bind(this);
        this.node.hide = this.hide.bind(this);
        this.node.on("SHOW", this.show, this);
        this.node.on("HIDE", this.hide, this);
    },

    onShowBtnClick(){
        this.show();
    },

    onHideBtnClick(){
        this.hide();
    },

    show(onStartCB = null, onCompleteCB = null) {
        this.showByType(true, this.tweenType, this.delayStart,  ()=>{
            if(this.forceChildrend){
                for(let i = 0; i<this.node.children.length; i++){
                    const child = this.node.children[i];
                    if(child) child.emit("SHOW");
                }
            }
            onStartCB && onStartCB ();
        }, onCompleteCB);
    },

    hide(onStartCB = null, onCompleteCB = null) {
        this.showByType(false, this.tweenType, this.delayStart, onStartCB, ()=>{
            if(this.forceChildrend){
                for(let i = 0; i<this.node.children.length; i++){
                    const child = this.node.children[i];
                    if(child) child.emit("HIDE");
                }
            }
            onCompleteCB && onCompleteCB();
        });
    },

    showByParams(){
        //Todo
    },

    showByType(isShow, type, delay, onStartcallback, onFinishedCallback){
        const{fromOpacity, toOpacity, fadeDuration, fadeEasing,
            fromPos, toPos, moveDuration, moveEasing ,
            fromScale, toScale, scaleDuration, scaleEasing,
            fromAngle, toAngle, rotateDuration, rotateEasing} = this.tweenViewConfig;
        this._startCB = onStartcallback;
        this._endCB = onFinishedCallback;
        switch (type){
            case TweenType.FADE:
                this._fadeTo(isShow?fromOpacity:toOpacity, isShow?toOpacity:fromOpacity, delay, fadeDuration, fadeEasing, this._startCB, this._endCB);
                break;
            case TweenType.MOVE:
                this._moveTo(isShow?fromPos:toPos, isShow?toPos:fromPos, delay, moveDuration, moveEasing, this._startCB, this._endCB);
                break;
            case TweenType.ZOOM:
                this._zoomTo(isShow?fromScale:toScale, isShow?toScale:fromPos, delay, scaleDuration, scaleEasing, this._startCB, this._endCB);
                break;
            case TweenType.ROTATE:
                this._rotateTo(isShow?fromAngle:toAngle, isShow?toAngle:fromPos, delay, rotateDuration, rotateEasing, this._startCB, this._endCB);
                break;
            case TweenType.FADE_AND_MOVE:
                this._fadeTo(isShow?fromOpacity:toOpacity, isShow?toOpacity:fromOpacity, delay, fadeDuration, fadeEasing, this._startCB, this._endCB);
                this._moveTo(isShow?fromPos:toPos, isShow?toPos:fromPos, delay, moveDuration, moveEasing, this._startCB, this._endCB);

                break;
            case TweenType.FADE_AND_ZOOM:
                this._fadeTo(isShow?fromOpacity:toOpacity, isShow?toOpacity:fromOpacity, delay, fadeDuration, fadeEasing, this._startCB, this._endCB);
                this._zoomTo(isShow?fromScale:toScale, isShow?toScale:fromPos, delay, scaleDuration, scaleEasing, this._startCB, this._endCB);
                break;
            case TweenType.FADE_AND_ROTATE:
                this._fadeTo(isShow?fromOpacity:toOpacity, isShow?toOpacity:fromOpacity, delay, fadeDuration, fadeEasing, this._startCB, this._endCB);
                this._rotateTo(isShow?fromAngle:toAngle, isShow?toAngle:fromPos, delay, rotateDuration, rotateEasing, this._startCB, this._endCB);
                break;
            case TweenType.MOVE_AND_ZOOM:
                this._moveTo(isShow?fromPos:toPos, isShow?toPos:fromPos, delay, moveDuration, moveEasing, this._startCB, this._endCB);
                this._zoomTo(isShow?fromScale:toScale, isShow?toScale:fromPos, delay, scaleDuration, scaleEasing, this._startCB, this._endCB);
                break;
            case TweenType.MOVE_AND_ROTATE:
                this._moveTo(isShow?fromPos:toPos, isShow?toPos:fromPos, delay, moveDuration, moveEasing, this._startCB, this._endCB);
                this._rotateTo(isShow?fromAngle:toAngle, isShow?toAngle:fromPos, delay, rotateDuration, rotateEasing, this._startCB, this._endCB);
                break;
            case TweenType.FADE_AND_MOVE_AND_ZOOM:
                this._fadeTo(isShow?fromOpacity:toOpacity, isShow?toOpacity:fromOpacity, delay, fadeDuration, fadeEasing, this._startCB, this._endCB);
                this._moveTo(isShow?fromPos:toPos, isShow?toPos:fromPos, delay, moveDuration, moveEasing, this._startCB, this._endCB);
                this._zoomTo(isShow?fromScale:toScale, isShow?toScale:fromPos, delay, scaleDuration, scaleEasing, this._startCB, this._endCB);
                break;
            case TweenType.FADE_AND_MOVE_AND_ROTATE:
                this._fadeTo(isShow?fromOpacity:toOpacity, isShow?toOpacity:fromOpacity, delay, fadeDuration, fadeEasing, this._startCB, this._endCB);
                this._moveTo(isShow?fromPos:toPos, isShow?toPos:fromPos, delay, moveDuration, moveEasing, this._startCB, this._endCB);
                this._rotateTo(isShow?fromAngle:toAngle, isShow?toAngle:fromPos, delay, rotateDuration, rotateEasing, this._startCB, this._endCB);
                break;
            case TweenType.FADE_AND_ROTATE_AND_ZOOM:
                this._fadeTo(isShow?fromOpacity:toOpacity, isShow?toOpacity:fromOpacity, delay, fadeDuration, fadeEasing, this._startCB, this._endCB);
                this._rotateTo(isShow?fromAngle:toAngle, isShow?toAngle:fromPos, delay, rotateDuration, rotateEasing, this._startCB, this._endCB);
                this._zoomTo(isShow?fromScale:toScale, isShow?toScale:fromPos, delay, scaleDuration, scaleEasing, this._startCB, this._endCB);
                break;
            case TweenType.MOVE_AND_ZOOM_AND_ROTATE:
                this._moveTo(isShow?fromPos:toPos, isShow?toPos:fromPos, delay, moveDuration, moveEasing, this._startCB, this._endCB);
                this._zoomTo(isShow?fromScale:toScale, isShow?toScale:fromPos, delay, scaleDuration, scaleEasing, this._startCB, this._endCB);
                this._rotateTo(isShow?fromAngle:toAngle, isShow?toAngle:fromPos, delay, rotateDuration, rotateEasing, this._startCB, this._endCB);
                break;
            case TweenType.FADE_AND_MOVE_AND_ZOOM_AND_ROTATE:
                this._fadeTo(isShow?fromOpacity:toOpacity, isShow?toOpacity:fromOpacity, delay, fadeDuration, fadeEasing, this._startCB, this._endCB);
                this._moveTo(isShow?fromPos:toPos, isShow?toPos:fromPos, delay, moveDuration, moveEasing, this._startCB, this._endCB);
                this._rotateTo(isShow?fromAngle:toAngle, isShow?toAngle:fromPos, delay, rotateDuration, rotateEasing, this._startCB, this._endCB);
                this._zoomTo(isShow?fromScale:toScale, isShow?toScale:fromPos, delay, scaleDuration, scaleEasing, this._startCB, this._endCB);
                break;
            case TweenType.OTHER:

                break;
        }
    },

    _fadeTo(fromOpacity, toOpacity, delay, duration, easing, startCallback, endCallback){
        let _delay = delay;
        let _duration = duration;
        if(this.tweenFade && this.stopPreviousTween) {
            this.tweenFade.stop();
            this.tweenFade = null;
            _delay = 0;
            _duration = 0.01;
        }else{
            this.node.opacity = fromOpacity;
        }
        this.tweenFade = cc.tween(this.node)
            .delay(_delay)
            .call(()=>{
                startCallback && startCallback();
                startCallback = null;
            })
            .to(_duration, {opacity: toOpacity}, {easing: easing})
            .call(()=>{
                endCallback && endCallback();
                endCallback = null;
                this.tweenFade = null;
            })
            .start();
        return this.tweenFade;
    },

    _moveTo(fromPos, toPos, delay, duration, easing, startCallback, endCallback){
        let _delay = delay;
        let _duration = duration;
        if( this.tweenMove && this.stopPreviousTween){
            this.tweenMove.stop();
            this.tweenMove = null;
            _delay = 0;
            _duration = 0.01;
        }else{
            this.node.posisition = fromPos;
        }  
        this.tweenMove = cc.tween(this.node)
            .delay(_delay)
            .call(()=>{
                startCallback && startCallback();
                startCallback = null;
            })
            .to(_duration, {position: toPos}, {easing: easing})
            .call(()=>{
                endCallback && endCallback();
                endCallback = null;
                this.tweenMove = null;
            })
            .start();
        return this.tweenMove;
    },

    _zoomTo(fromScale, toScale, delay, duration, easing, startCallback, endCallback){
        let _delay = delay;
        let _duration = duration;
        
        if(this.tweenZoom && this.stopPreviousTween){
            this.tweenZoom.stop();
            this.tweenZoom = null;
            _delay = 0;
            _duration = 0.01;
        }else{
            this.node.scale = fromScale;
        }
        this.tweenZoom = cc.tween(this.node)
            .delay(_delay)
            .call(()=>{
                startCallback && startCallback();
                startCallback = null;
            })
            .to(_duration, {scale: toScale}, {easing: easing})
            .call(()=>{
                endCallback && endCallback();
                endCallback = null;
                this.tweenZoom = null;
            })
            .start();
        return this.tweenZoom;
    },

    _rotateTo(fromAngle, toAngle, delay, duration, easing, startCallback, endCallback){
        let _delay = delay;
        let _duration = duration;
        if(this.tweenRotate && this.stopPreviousTween) {
            this.tweenRotate.stop();
            this.tweenRotate = null;
            _delay = 0;
            _duration = 0.01;
        }else{
            this.node.angle = fromAngle;
        }
        this.tweenRotate = cc.tween(this.node)
            .delay(_delay)
            .call(()=>{
                startCallback && startCallback();
                startCallback = null;
            })
            .to(_duration, {angle: toAngle}, {easing: easing})
            .call(()=>{
                endCallback && endCallback();
                endCallback = null;
                this.tweenRotate = null;
            })
            .start();
        return this.tweenRotate;
    },

    onDestroy(){
        if(this.tweenFade) this.tweenFade.stop();
        if( this.tweenMove)  this.tweenMove.stop();
        if(this.tweenZoom) this.tweenZoom.stop();
        if(this.tweenRotate) this.tweenRotate.stop();
        this.unscheduleAllCallbacks();
    },

});
