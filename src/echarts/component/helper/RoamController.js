define("crm-modules/common/echarts/component/helper/RoamController", [ "crm-modules/common/echarts/zrender/mixin/Eventful", "crm-modules/common/echarts/zrender/core/util", "crm-modules/common/echarts/zrender/core/event", "./interactionMutex" ], function(require, exports, module) {
    var Eventful = require("crm-modules/common/echarts/zrender/mixin/Eventful");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var eventTool = require("crm-modules/common/echarts/zrender/core/event");
    var interactionMutex = require("./interactionMutex");
    function mousedown(e) {
        if (e.target && e.target.draggable) {
            return;
        }
        var x = e.offsetX;
        var y = e.offsetY;
        var rect = this.rect;
        if (rect && rect.contain(x, y)) {
            this._x = x;
            this._y = y;
            this._dragging = true;
        }
    }
    function mousemove(e) {
        if (!this._dragging) {
            return;
        }
        eventTool.stop(e.event);
        if (e.gestureEvent !== "pinch") {
            if (interactionMutex.isTaken("globalPan", this._zr)) {
                return;
            }
            var x = e.offsetX;
            var y = e.offsetY;
            var dx = x - this._x;
            var dy = y - this._y;
            this._x = x;
            this._y = y;
            var target = this.target;
            if (target) {
                var pos = target.position;
                pos[0] += dx;
                pos[1] += dy;
                target.dirty();
            }
            eventTool.stop(e.event);
            this.trigger("pan", dx, dy);
        }
    }
    function mouseup(e) {
        this._dragging = false;
    }
    function mousewheel(e) {
        eventTool.stop(e.event);
        var zoomDelta = e.wheelDelta > 0 ? 1.1 : 1 / 1.1;
        zoom.call(this, e, zoomDelta, e.offsetX, e.offsetY);
    }
    function pinch(e) {
        if (interactionMutex.isTaken("globalPan", this._zr)) {
            return;
        }
        eventTool.stop(e.event);
        var zoomDelta = e.pinchScale > 1 ? 1.1 : 1 / 1.1;
        zoom.call(this, e, zoomDelta, e.pinchX, e.pinchY);
    }
    function zoom(e, zoomDelta, zoomX, zoomY) {
        var rect = this.rect;
        if (rect && rect.contain(zoomX, zoomY)) {
            var target = this.target;
            if (target) {
                var pos = target.position;
                var scale = target.scale;
                var newZoom = this._zoom = this._zoom || 1;
                newZoom *= zoomDelta;
                var zoomScale = newZoom / this._zoom;
                this._zoom = newZoom;
                pos[0] -= (zoomX - pos[0]) * (zoomScale - 1);
                pos[1] -= (zoomY - pos[1]) * (zoomScale - 1);
                scale[0] *= zoomScale;
                scale[1] *= zoomScale;
                target.dirty();
            }
            this.trigger("zoom", zoomDelta, zoomX, zoomY);
        }
    }
    function RoamController(zr, target, rect) {
        this.target = target;
        this.rect = rect;
        this._zr = zr;
        var bind = zrUtil.bind;
        var mousedownHandler = bind(mousedown, this);
        var mousemoveHandler = bind(mousemove, this);
        var mouseupHandler = bind(mouseup, this);
        var mousewheelHandler = bind(mousewheel, this);
        var pinchHandler = bind(pinch, this);
        Eventful.call(this);
        this.enable = function(controlType) {
            this.disable();
            if (controlType == null) {
                controlType = true;
            }
            if (controlType && controlType !== "scale") {
                zr.on("mousedown", mousedownHandler);
                zr.on("mousemove", mousemoveHandler);
                zr.on("mouseup", mouseupHandler);
            }
            if (controlType && controlType !== "move") {
                zr.on("mousewheel", mousewheelHandler);
                zr.on("pinch", pinchHandler);
            }
        };
        this.disable = function() {
            zr.off("mousedown", mousedownHandler);
            zr.off("mousemove", mousemoveHandler);
            zr.off("mouseup", mouseupHandler);
            zr.off("mousewheel", mousewheelHandler);
            zr.off("pinch", pinchHandler);
        };
        this.dispose = this.disable;
        this.isDragging = function() {
            return this._dragging;
        };
        this.isPinching = function() {
            return this._pinching;
        };
    }
    zrUtil.mixin(RoamController, Eventful);
    return RoamController;
});