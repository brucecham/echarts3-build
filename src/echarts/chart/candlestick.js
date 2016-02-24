define("crm-modules/common/echarts/chart/candlestick", [ "../echarts", "./candlestick/CandlestickSeries", "./candlestick/CandlestickView", "./candlestick/preprocessor", "./candlestick/candlestickVisual", "./candlestick/candlestickLayout" ], function(require, exports, module) {
    var echarts = require("../echarts");
    require("./candlestick/CandlestickSeries");
    require("./candlestick/CandlestickView");
    echarts.registerPreprocessor(require("./candlestick/preprocessor"));
    echarts.registerVisualCoding("chart", require("./candlestick/candlestickVisual"));
    echarts.registerLayout(require("./candlestick/candlestickLayout"));
});