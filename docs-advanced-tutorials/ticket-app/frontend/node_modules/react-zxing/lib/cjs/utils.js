"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepCompareObjects = void 0;
var deepCompareObjects = function (a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
};
exports.deepCompareObjects = deepCompareObjects;
