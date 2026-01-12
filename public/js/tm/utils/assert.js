export function assert(condition, message) {
    if (!condition) {
        throw new Error(message !== null && message !== void 0 ? message : "Assertion failed");
    }
}
//# sourceMappingURL=assert.js.map