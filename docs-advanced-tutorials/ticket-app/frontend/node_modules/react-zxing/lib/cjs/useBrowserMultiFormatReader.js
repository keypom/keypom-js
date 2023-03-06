"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBrowserMultiFormatReader = void 0;
var library_1 = require("@zxing/library");
var react_1 = require("react");
var constants_1 = require("./constants");
var useBrowserMultiFormatReader = function (_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.timeBetweenDecodingAttempts, timeBetweenDecodingAttempts = _c === void 0 ? constants_1.DEFAULT_TIME_BETWEEN_DECODING_ATTEMPTS : _c, hints = _b.hints;
    return (0, react_1.useMemo)(function () {
        var instance = new library_1.BrowserMultiFormatReader(hints);
        instance.timeBetweenDecodingAttempts = timeBetweenDecodingAttempts;
        return instance;
    }, [hints, timeBetweenDecodingAttempts]);
};
exports.useBrowserMultiFormatReader = useBrowserMultiFormatReader;
