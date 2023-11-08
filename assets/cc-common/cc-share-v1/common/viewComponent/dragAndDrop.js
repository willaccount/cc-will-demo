

const TouchDragger = cc.Class({
    extends: cc.Component,

    setEventClick(callback) {
        this.callback = callback;
    },

    setEventMoveOpen(callbackMoveOpen) {
        this.callbackMoveOpen = callbackMoveOpen;
    },

    setEventMoveClose(callbackMoveClose) {
        this.callbackMoveClose = callbackMoveClose;
    },
    noDraggableToNode(noDraggableToNode){
        this.noDraggableToNode = noDraggableToNode;  
    },
    onLoad() {
        this.initDNR();
    },

    initDNR() {
        const node = this.node;
        node.beforMove = {x: node.x , y: node.y};

        node.on(cc.Node.EventType.TOUCH_START, () => {
            node.beforMove = {x: node.x , y: node.y};
        });
        node.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            const delta = event.touch.getDelta();
            node.x += delta.x;
            node.y += delta.y;
            if (node.getComponent(TouchDragger).propagate)
                event.stopPropagation();
            node.propagate = true;
            if (this.callbackMoveOpen) this.callbackMoveOpen();
            if (this.callbackMoveClose) this.callbackMoveClose();
        });

        node.on(cc.Node.EventType.TOUCH_END, () => {
            if (Math.sqrt((Math.pow(node.x-node.beforMove.x,2))+(Math.pow(node.y-node.beforMove.y,2))) < 3){
                node.propagate = false;
                
            }
            if (node.propagate) {
                if(this.noDraggableToNode){
                    if(checkTwoRectanglesOverlap(this.noDraggableToNode,node)){
                        const moveTo = cc.moveTo(0.3, cc.v2(node.beforMove.x, node.beforMove.y));
                        node.runAction(moveTo);
                    }
                }
                node.propagate = !node.propagate;
            } else  if (this.callback) this.callback();
               
           
        });

        function checkTwoRectanglesOverlap(rectangle1, rectangle2 ){
            let inside = false;
            const top_left = {x: rectangle2.x, y: rectangle2.y + rectangle2.height};
            const bottom_left = {x: rectangle2.x, y: rectangle2.y};
            const top_right = {x: rectangle2.x + rectangle2.width , y: rectangle2.y + rectangle2.height};
            const bottom_right = {x: rectangle2.x + rectangle2.width, y: rectangle2.y};
            if( checkPointInsideRectangle(top_left,rectangle1)||
                checkPointInsideRectangle(bottom_left,rectangle1)||
                checkPointInsideRectangle(top_right,rectangle1)||
                checkPointInsideRectangle(bottom_right,rectangle1)){
                inside = true;
            }
            return inside;
        }

        function checkPointInsideRectangle(point, rectangle ){
            let inside = false;
            if ((point.x - rectangle.x) >=0 && 
                (point.y - rectangle.y) >=0 && 
                point.x <= (rectangle.x + rectangle.width) &&
                point.y <= (rectangle.y + rectangle.height)) {
                inside = true;
            }
            return inside;
        }
    }
});