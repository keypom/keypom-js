// lib/Storage.ts

class FastAuthStorage {
    private prefix: string;

    constructor(prefix = "FAST_AUTH_WALLET:") {
        this.prefix = prefix;
    }

    setItem(key: string, value: string) {
        localStorage.setItem(this.prefix + key, value);
    }

    getItem(key: string): string | null {
        return localStorage.getItem(this.prefix + key);
    }

    removeItem(key: string) {
        localStorage.removeItem(this.prefix + key);
    }

    clear() {
        // Remove all items with the prefix
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
}

export default new FastAuthStorage();
