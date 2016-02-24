define("crm-modules/common/echarts/view/Component", [ "crm-modules/common/echarts/zrender/container/Group", "../util/component", "../util/clazz" ], function(require, exports, module) {
    var Group = require("crm-modules/common/echarts/zrender/container/Group");
    var componentUtil = require("../util/component");
    var clazzUtil = require("../util/clazz");
    var Component = function() {
        this.group = new Group();
        this.uid = componentUtil.getUID("viewComponent");
    };
    Component.prototype = {
        constructor: Component,
        init: function(ecModel, api) {},
        render: function(componentModel, ecModel, api, payload) {},
        dispose: function() {}
    };
    var componentProto = Component.prototype;
    componentProto.updateView = componentProto.updateLayout = componentProto.updateVisual = function(seriesModel, ecModel, api, payload) {};
    clazzUtil.enableClassExtend(Component);
    clazzUtil.enableClassManagement(Component, {
        registerWhenExtend: true
    });
    return Component;
});