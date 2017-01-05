
function getPointDis(ax, ay, bx, by) {
    return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
}
function isPointInCycle(x, y, circleX, circleY, radius){
    return (getPointDis(x, y, circleX, circleY) < radius) ? true : false;
}

module.exports = class {
    constructor(canvasid, context, cb, opt){
        this.touchPoints = [];
        this.checkPoints = [];
        this.canvasid = canvasid;
        this.ctx = context;
        this.width = opt && opt.width || 300; //画布长度
        this.height = opt && opt.height || 300; //画布宽度
        this.cycleNum = opt && opt.cycleNum || 3;
        this.radius = 0;  //触摸点半径
        this.isParamOk = false;
        this.marge = this.margeCircle = 25; //触摸点及触摸点和画布边界间隔
        this.initColor = opt && opt.initColor || '#C5C5C3';   
        this.checkColor = opt && opt.checkColor || '#5AA9EC';
        this.errorColor = opt && opt.errorColor || '#e19984';
        this.touchState = "unTouch";
        this.checkParam();
        this.lastCheckPoint = null;
        if (this.isParamOk) {
            // 计算触摸点的半径长度
            this.radius = (this.width - this.marge * 2 - (this.margeCircle * (this.cycleNum - 1))) / (this.cycleNum * 2)
            this.radius = Math.floor(this.radius);
            // 计算每个触摸点的圆心位置
            this.calCircleParams();
        }
        this.onEnd = cb; //滑动手势结束时的回调函数
    }

    checkParam() {
        this.isParamOk = !(this.width < 200 || this.height < 200 || this.cycleNum < 2);
    }

    drawGestureLock(){
        if (!this.isParamOk){
            return
        }
        for (let i = 0; i < this.touchPoints.length; i++){
            this.drawCircle(this.touchPoints[i].x, this.touchPoints[i].y, this.radius, this.initColor)
        }
        this.ctx.draw(true);
    }

    calCircleParams() {
        let n = this.cycleNum;
        let count = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++){
                count++;
                let touchPoint = {
                    x: this.marge + i * (this.radius * 2 + this.margeCircle) + this.radius,
                    y: this.marge + j * (this.radius * 2 + this.margeCircle) + this.radius,
                    index: count,
                    check: "uncheck",
                }
                this.touchPoints.push(touchPoint)
            }
        }
    }

    drawCanvas(color, point) {
        //每次更新之前先清空画布
        this.ctx.clearRect(0, 0, this.width, this.height);
        //使用不同颜色和形式绘制已触发和未触发的锁
        for (let i = 0; i < this.touchPoints.length; i++){
            let point = this.touchPoints[i];
            if (point.check === "check") {
                this.drawCircle(point.x, point.y, this.radius, color);
                this.drawCircleCentre(point.x, point.y, color);
            }
            else {
                this.drawCircle(this.touchPoints[i].x, this.touchPoints[i].y, this.radius, this.initColor)
            }
        }
        //绘制已识别锁之间的线段
        if (this.checkPoints.length > 1) {
             let lastPoint = this.checkPoints[0];
             for (let i = 1; i < this.checkPoints.length; i++) {
                 this.drawLine(lastPoint, this.checkPoints[i], color);
                 lastPoint = this.checkPoints[i];
             }
        }
        //绘制最后一个识别锁和当前触摸点之间的线段
        if (this.lastCheckPoint && point) {
            this.drawLine(this.lastCheckPoint, point, color);
        }
        this.ctx.draw(true);
    }

    drawCircle(centreX, centreY, radius, color){
        this.ctx.beginPath();
        this.ctx.setStrokeStyle(color);
        this.ctx.setLineWidth(2);
        this.ctx.arc(centreX, centreY, radius, 0, Math.PI * 2, true);
        this.ctx.stroke();
    }

    drawCircleCentre(centreX, centreY, color){
        this.ctx.beginPath();
        this.ctx.setStrokeStyle(color);
        this.ctx.setLineWidth(1);
        this.ctx.arc(centreX, centreY, 9, 0, Math.PI * 2, true);
        this.ctx.stroke();
    }

    drawLine(pFromX, pTo, color) {
        this.ctx.beginPath();
        this.ctx.setStrokeStyle(color);
        this.ctx.setLineWidth(3);
        this.ctx.moveTo(pFromX.x, pFromX.y);
        this.ctx.lineTo(pTo.x, pTo.y);
        this.ctx.stroke();
    }

    gestureError() {
        this.drawCanvas(this.errorColor)
    }

    getCheckPoint() {
        return this.checkPoints;
    }

    reset() {
        for (let i = 0; i < this.touchPoints.length; i++) {
            this.touchPoints[i].check = 'uncheck';
        }
        this.checkPoints = [];
        this.lastCheckPoint = null;
        this.drawCanvas(this.initColor);
    }

    checkTouch(e) {
        for (let i = 0; i < this.touchPoints.length; i++){
            let point = this.touchPoints[i];
            if (isPointInCycle(e.touches[0].x, e.touches[0].y, point.x, point.y, this.radius)) {
                if (point.check === 'uncheck') {
                    this.checkPoints.push(point);
                    this.lastCheckPoint = point;
                }
                point.check = "check"
                return;
            }
        }
    }

    onTouchStart(e) {
        // 不识别多点触控
        if (e.touches.length > 1){
            this.touchState = "unTouch";
            return;
        }
        this.touchState = "startTouch";
        this.checkTouch(e);
        let point = {x:e.touches[0].x, y:e.touches[0].y};
        this.drawCanvas(this.checkColor, point);
    }

    onTouchMove(e) {
        if (e.touchState === "unTouch") {
            return;
        }
        if (e.touches.length > 1){
            this.touchState = "unTouch";
            return;
        }
        this.checkTouch(e);
        let point = {x:e.touches[0].x, y:e.touches[0].y};
        this.drawCanvas(this.checkColor, point);
    }

    onTouchEnd(e) {
        typeof this.onEnd === 'function' && this.onEnd(this.checkPoints, false);
    }

    onTouchCancel(e) {
        typeof this.onEnd === 'function' && this.onEnd(this.checkPoints, true);
    }
}
