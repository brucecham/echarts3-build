define("crm-modules/common/echarts/component/dataZoom/dataZoomAction", [ "crm-modules/common/echarts/zrender/core/util", "../../util/model", "../../echarts" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var modelUtil = require("../../util/model");
    var echarts = require("../../echarts");
    echarts.registerAction("dataZoom", function(payload, ecModel) {
        var linkedNodesFinder = modelUtil.createLinkedNodesFinder(zrUtil.bind(ecModel.eachComponent, ecModel, "dataZoom"), modelUtil.eachAxisDim, function(model, dimNames) {
            return model.get(dimNames.axisIndex);
        });
        var effectedModels = [];
        ecModel.eachComponent({
            mainType: "dataZoom",
            query: payload
        }, function(model, index) {
            effectedModels.push.apply(effectedModels, linkedNodesFinder(model).nodes);
        });
        zrUtil.each(effectedModels, function(dataZoomModel, index) {
            dataZoomModel.setRawRange({
                start: payload.start,
                end: payload.end,
                startValue: payload.startValue,
                endValue: payload.endValue
            });
        });
    });
});