import { BrowserMultiFormatReader } from "@zxing/library";
import { useMemo } from "react";
import { DEFAULT_TIME_BETWEEN_DECODING_ATTEMPTS } from "./constants";
export var useBrowserMultiFormatReader = function (_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.timeBetweenDecodingAttempts, timeBetweenDecodingAttempts = _c === void 0 ? DEFAULT_TIME_BETWEEN_DECODING_ATTEMPTS : _c, hints = _b.hints;
    return useMemo(function () {
        var instance = new BrowserMultiFormatReader(hints);
        instance.timeBetweenDecodingAttempts = timeBetweenDecodingAttempts;
        return instance;
    }, [hints, timeBetweenDecodingAttempts]);
};
