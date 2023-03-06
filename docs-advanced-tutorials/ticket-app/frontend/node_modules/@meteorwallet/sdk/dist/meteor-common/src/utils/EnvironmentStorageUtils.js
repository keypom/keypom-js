"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentStateAdapter_Sync = exports.EnvironmentStateAdapter = void 0;
class EnvironmentStateAdapter {
    constructor(implementation) {
        this.implementation = implementation;
    }
    async setJson(key, value) {
        await this.implementation.setString(key, JSON.stringify(value));
    }
    async getJson(key) {
        const val = await this.implementation.getString(key);
        if (val == null || val === "undefined" || val === "null") {
            return undefined;
        }
        return JSON.parse(val);
    }
    async setString(key, value) {
        await this.implementation.setString(key, value);
    }
    async getString(key) {
        const val = await this.implementation.getString(key);
        if (val == null) {
            return undefined;
        }
        return val;
    }
    createJsonGetterSetter(key) {
        return {
            get: () => this.getJson(key),
            set: (value) => this.setJson(key, value),
        };
    }
    createStringGetterSetter(key) {
        return {
            get: () => this.getString(key),
            set: (value) => this.setString(key, value),
        };
    }
}
exports.EnvironmentStateAdapter = EnvironmentStateAdapter;
class EnvironmentStateAdapter_Sync {
    constructor(implementation) {
        this.implementation = implementation;
    }
    setJson(key, value) {
        this.implementation.setString(key, JSON.stringify(value));
    }
    getJson(key) {
        const val = this.implementation.getString(key);
        if (val == null || val === "undefined" || val === "null") {
            return undefined;
        }
        return JSON.parse(val);
    }
    setString(key, value) {
        this.implementation.setString(key, value);
    }
    getString(key) {
        const val = this.implementation.getString(key);
        if (val == null) {
            return undefined;
        }
        return val;
    }
    clear(key) {
        this.implementation.clear(key);
    }
    createJsonGetterSetter(key) {
        return {
            get: () => this.getJson(key),
            set: (value) => this.setJson(key, value),
        };
    }
    createStringGetterSetter(key) {
        return {
            get: () => this.getString(key),
            set: (value) => this.setString(key, value),
        };
    }
}
exports.EnvironmentStateAdapter_Sync = EnvironmentStateAdapter_Sync;
//# sourceMappingURL=EnvironmentStorageUtils.js.map