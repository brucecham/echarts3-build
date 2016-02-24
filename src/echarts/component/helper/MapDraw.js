define("crm-modules/common/echarts/component/helper/MapDraw", [ "./RoamController", "../../util/graphic", "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    var RoamController = require("./RoamController");
    var graphic = require("../../util/graphic");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    function getFixedItemStyle(model, scale) {
        var itemStyle = model.getItemStyle();
        var areaColor = model.get("areaColor");
        if (areaColor) {
            itemStyle.fill = areaColor;
        }
        return itemStyle;
    }
    function updateMapSelectHandler(mapOrGeoModel, data, group, api, fromView) {
        group.off("click");
        mapOrGeoModel.get("selectedMode") && group.on("click", function(e) {
            var dataIndex = e.target.dataIndex;
            if (dataIndex != null) {
                var name = data.getName(dataIndex);
                api.dispatchAction({
                    type: "mapToggleSelect",
                    seriesIndex: mapOrGeoModel.seriesIndex,
                    name: name,
                    from: fromView.uid
                });
                updateMapSelected(mapOrGeoModel, data, api);
            }
        });
    }
    function updateMapSelected(mapOrGeoModel, data) {
        data.eachItemGraphicEl(function(el, idx) {
            var name = data.getName(idx);
            el.trigger(mapOrGeoModel.isSelected(name) ? "emphasis" : "normal");
        });
    }
    function MapDraw(api, updateGroup) {
        var group = new graphic.Group();
        this._controller = new RoamController(api.getZr(), updateGroup ? group : null, null);
        this.group = group;
        this._updateGroup = updateGroup;
    }
    MapDraw.prototype = {
        constructor: MapDraw,
        draw: function(mapOrGeoModel, ecModel, api, fromView) {
            var data = mapOrGeoModel.getData && mapOrGeoModel.getData();
            var geo = mapOrGeoModel.coordinateSystem;
            var group = this.group;
            group.removeAll();
            var scale = geo.scale;
            group.position = geo.position.slice();
            group.scale = scale.slice();
            var itemStyleModel;
            var hoverItemStyleModel;
            var itemStyle;
            var hoverItemStyle;
            var labelModel;
            var hoverLabelModel;
            var itemStyleAccessPath = [ "itemStyle", "normal" ];
            var hoverItemStyleAccessPath = [ "itemStyle", "emphasis" ];
            var labelAccessPath = [ "label", "normal" ];
            var hoverLabelAccessPath = [ "label", "emphasis" ];
            if (!data) {
                itemStyleModel = mapOrGeoModel.getModel(itemStyleAccessPath);
                hoverItemStyleModel = mapOrGeoModel.getModel(hoverItemStyleAccessPath);
                itemStyle = getFixedItemStyle(itemStyleModel, scale);
                hoverItemStyle = getFixedItemStyle(hoverItemStyleModel, scale);
                labelModel = mapOrGeoModel.getModel(labelAccessPath);
                hoverLabelModel = mapOrGeoModel.getModel(hoverLabelAccessPath);
            }
            zrUtil.each(geo.regions, function(region) {
                var regionGroup = new graphic.Group();
                var dataIdx;
                if (data) {
                    dataIdx = data.indexOfName(region.name);
                    var itemModel = data.getItemModel(dataIdx);
                    var visualColor = data.getItemVisual(dataIdx, "color", true);
                    itemStyleModel = itemModel.getModel(itemStyleAccessPath);
                    hoverItemStyleModel = itemModel.getModel(hoverItemStyleAccessPath);
                    itemStyle = getFixedItemStyle(itemStyleModel, scale);
                    hoverItemStyle = getFixedItemStyle(hoverItemStyleModel, scale);
                    labelModel = itemModel.getModel(labelAccessPath);
                    hoverLabelModel = itemModel.getModel(hoverLabelAccessPath);
                    if (visualColor) {
                        itemStyle.fill = visualColor;
                    }
                }
                var textStyleModel = labelModel.getModel("textStyle");
                var hoverTextStyleModel = hoverLabelModel.getModel("textStyle");
                zrUtil.each(region.contours, function(contour) {
                    var polygon = new graphic.Polygon({
                        shape: {
                            points: contour
                        },
                        style: {
                            strokeNoScale: true
                        },
                        culling: true
                    });
                    polygon.setStyle(itemStyle);
                    regionGroup.add(polygon);
                });
                var showLabel = labelModel.get("show");
                var hoverShowLabel = hoverLabelModel.get("show");
                var isDataNaN = data && isNaN(data.get("value", dataIdx));
                var itemLayout = data && data.getItemLayout(dataIdx);
                if (!data || isDataNaN && (showLabel || hoverShowLabel) || itemLayout && itemLayout.showLabel) {
                    var query = data ? dataIdx : region.name;
                    var formattedStr = mapOrGeoModel.getFormattedLabel(query, "normal");
                    var hoverFormattedStr = mapOrGeoModel.getFormattedLabel(query, "emphasis");
                    var text = new graphic.Text({
                        style: {
                            text: showLabel ? formattedStr || region.name : "",
                            fill: textStyleModel.getTextColor(),
                            textFont: textStyleModel.getFont(),
                            textAlign: "center",
                            textBaseline: "middle"
                        },
                        hoverStyle: {
                            text: hoverShowLabel ? hoverFormattedStr || region.name : "",
                            fill: hoverTextStyleModel.getTextColor(),
                            textFont: hoverTextStyleModel.getFont()
                        },
                        position: region.center.slice(),
                        scale: [ 1 / scale[0], 1 / scale[1] ],
                        z2: 10,
                        silent: true
                    });
                    regionGroup.add(text);
                }
                data && data.setItemGraphicEl(dataIdx, regionGroup);
                graphic.setHoverStyle(regionGroup, hoverItemStyle);
                group.add(regionGroup);
            });
            this._updateController(mapOrGeoModel, ecModel, api);
            data && updateMapSelectHandler(mapOrGeoModel, data, group, api, fromView);
            data && updateMapSelected(mapOrGeoModel, data);
        },
        remove: function() {
            this.group.removeAll();
            this._controller.dispose();
        },
        _updateController: function(mapOrGeoModel, ecModel, api) {
            var geo = mapOrGeoModel.coordinateSystem;
            var controller = this._controller;
            controller.enable(mapOrGeoModel.get("roam") || false);
            var mainType = mapOrGeoModel.type.split(".")[0];
            controller.off("pan").on("pan", function(dx, dy) {
                api.dispatchAction({
                    type: "geoRoam",
                    component: mainType,
                    name: mapOrGeoModel.name,
                    dx: dx,
                    dy: dy
                });
            });
            controller.off("zoom").on("zoom", function(zoom, mouseX, mouseY) {
                api.dispatchAction({
                    type: "geoRoam",
                    component: mainType,
                    name: mapOrGeoModel.name,
                    zoom: zoom,
                    originX: mouseX,
                    originY: mouseY
                });
                if (this._updateGroup) {
                    var group = this.group;
                    var scale = group.scale;
                    group.traverse(function(el) {
                        if (el.type === "text") {
                            el.attr("scale", [ 1 / scale[0], 1 / scale[1] ]);
                        }
                    });
                }
            }, this);
            controller.rect = geo.getViewRect();
        }
    };
    return MapDraw;
});