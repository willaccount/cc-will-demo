

cc.Class({
    extends: cc.Component,

    properties: {
        useBezier: true,
        startPoint: cc.Vec3,
        endPoint: cc.Vec3,
        curvePoint1: cc.Vec3,
        curvePoint2: cc.Vec3,
        tweenTime: 1,
        scaleOffset: 1,
        FOV: 100,
        fadeOutEnding: true,
    },

    onLoad()
    {
        this.setBezier(this.startPoint, this.curvePoint1, this.curvePoint2, this.endPoint);
        this.node.on("START_TWEEN", this.tween.bind(this));
        this.isFading = false;
    },

    tween(callback, time=1)
    {
        this.node.stopAllActions();
        this.isFading = false;
        this.tweenTime = time;
        this.node.active = true;
        this.node.opacity = 0;
        this.node.runAction(cc.fadeIn(0.5));
        this.currentTime = 0;
        this.currentPos = this.p0;
        this.transformPosition2D();
        this.callback = callback;
        this.running = true;
    },

    update (dt) {
        if (this.running)
        {
            this.currentTime += dt/2;

            if (this.currentTime < this.tweenTime)
            {
                this.currentPos = this.GetPointAtTime(this.currentTime/this.tweenTime);
                this.transformPosition2D();
                if (this.currentTime >= this.tweenTime * 0.8 && !this.isFading)
                {
                    this.isFading = true;
                    this.node.runAction(cc.fadeOut(this.tweenTime * 0.2));
                }
            }
            else
            {
                this.currentTime = this.tweenTime;
                this.transformPosition2D();
                this.running = false;
                this.callback && this.callback();
                this.node.runAction(cc.fadeOut(0.3));
            }
        }
    },

    transformPosition2D()
    {
        this.node.scale = this.FOV/(this.FOV + this.currentPos.z);
        this.node.x = this.currentPos.x * this.node.scale;
        this.node.y = this.currentPos.y * this.node.scale;
        this.node.scale *= this.scaleOffset;
    },

    setBezier(v0, v1, v2,v3)
    {
        this.p0 = v0;
        this.p1 = v1;
        this.p2 = v2;
        this.p3 = v3;	
    },

    GetPointAtTime(timePoint)
    {
        let p = cc.v3(0,0,0);
        if (this.useBezier)
        {
            let u = 1 - timePoint;
            let tt = timePoint * timePoint;
            let uu = u * u;
            let uuu = uu * u;
            let ttt = tt * timePoint;
            
            p = cc.v3(uuu * this.p0.x, uuu * this.p0.y, uuu * this.p0.z); //first term
            p.x += 3 * uu * timePoint * this.p1.x; //second term
            p.x += 3 * u * tt * this.p2.x; //third term
            p.x += ttt * this.p3.x; //fourth term
            
            p.y += 3 * uu * timePoint * this.p1.y; //second term
            p.y += 3 * u * tt * this.p2.y; //third term
            p.y += ttt * this.p3.y; //fourth term
            
            p.z += 3 * uu * timePoint * this.p1.z; //second term
            p.z += 3 * u * tt * this.p2.z; //third term
            p.z += ttt * this.p3.z; //fourth term*/
        }
        else
        {
            p = cc.v3(this.p0.x, this.p0.y, this.p0.z);
            p.x = this.p0.x + (this.p3.x - this.p0.x) * timePoint;
            p.y = this.p0.y + (this.p3.y - this.p0.y) * timePoint;
            p.z = this.p0.z + (this.p3.z - this.p0.z) * timePoint;
        }
        return p;
    }
});
