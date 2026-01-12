export class Result {
    constructor(value, error) {
        this.value = value !== null && value !== void 0 ? value : null;
        this.error = error !== null && error !== void 0 ? error : null;
    }
    static ok(value) {
        return new Result(value);
    }
    static err(message) {
        return new Result(undefined, new Error(message));
    }
    isOk() { return !this.error; }
    isErr() { return !!this.error; }
    unwrapOr(value) {
        var _a;
        return (_a = this.value) !== null && _a !== void 0 ? _a : value;
    }
}
//# sourceMappingURL=result.js.map