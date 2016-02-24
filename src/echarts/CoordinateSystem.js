define("crm-modules/common/echarts/CoordinateSystem", [], function(require, exports, module) {
    "use strict";
    var coordinateSystemCreators = {};
    function CoordinateSystemManager() {
        this._coordinateSystems = {};
        this._coordinateSystemsList = [];
    }
    CoordinateSystemManager.prototype = {
        constructor: CoordinateSystemManager,
        update: function(ecModel, api) {
            var coordinateSystems = {};
            for (var type in coordinateSystemCreators) {
                coordinateSystems[type] = coordinateSystemCreators[type].create(ecModel, api);
            }
            this._coordinateSystems = coordinateSystems;
        },
        get: function(type, idx) {
            var list = this._coordinateSystems[type];
            if (list) {
                return list[idx || 0];
            }
        }
    };
    CoordinateSystemManager.register = function(type, coordinateSystemCreator) {
        coordinateSystemCreators[type] = coordinateSystemCreator;
    };
    CoordinateSystemManager.get = function(type) {
        return coordinateSystemCreators[type];
    };
    return CoordinateSystemManager;
});