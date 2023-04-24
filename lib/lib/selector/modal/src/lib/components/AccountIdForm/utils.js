"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCOUNT_CHECK_TIMEOUT = exports.classNames = void 0;
var classNames = function (names) {
    if (!names) {
        return false;
    }
    var isArray = Array.isArray;
    if (typeof names === "string") {
        return names || "";
    }
    if (isArray(names) && names.length > 0) {
        return names
            .map(function (name) { return (0, exports.classNames)(name); })
            .filter(function (name) { return !!name; })
            .join(" ");
    }
    return Object.keys(names)
        .filter(function (key) { return names[key]; })
        .join(" ");
};
exports.classNames = classNames;
exports.ACCOUNT_CHECK_TIMEOUT = 500;
