define("crm-modules/common/echarts/model/mixin/textStyle", [ "crm-modules/common/echarts/zrender/contain/text" ], function(require, exports, module) {
    var textContain = require("crm-modules/common/echarts/zrender/contain/text");
    function getShallow(model, path) {
        return model && model.getShallow(path);
    }
    return {
        getTextColor: function() {
            var ecModel = this.ecModel;
            return this.getShallow("color") || ecModel && ecModel.get("textStyle.color");
        },
        getFont: function() {
            var ecModel = this.ecModel;
            var gTextStyleModel = ecModel && ecModel.getModel("textStyle");
            return [ this.getShallow("fontStyle") || getShallow(gTextStyleModel, "fontStyle"), this.getShallow("fontWeight") || getShallow(gTextStyleModel, "fontWeight"), (this.getShallow("fontSize") || getShallow(gTextStyleModel, "fontSize") || 12) + "px", this.getShallow("fontFamily") || getShallow(gTextStyleModel, "fontFamily") || "sans-serif" ].join(" ");
        },
        getTextRect: function(text) {
            var textStyle = this.get("textStyle") || {};
            return textContain.getBoundingRect(text, this.getFont(), textStyle.align, textStyle.baseline);
        },
        ellipsis: function(text, containerWidth, options) {
            return textContain.ellipsis(text, this.getFont(), containerWidth, options);
        }
    };
});