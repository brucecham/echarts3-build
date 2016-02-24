define("crm-modules/common/echarts/coord/geo/fix/geoCoord", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var geoCoordMap = {
        Russia: [ 100, 60 ],
        "United States of America": [ -99, 38 ]
    };
    return function(geo) {
        zrUtil.each(geo.regions, function(region) {
            var geoCoord = geoCoordMap[region.name];
            if (geoCoord) {
                var cp = region.center;
                cp[0] = geoCoord[0];
                cp[1] = geoCoord[1];
            }
        });
    };
});