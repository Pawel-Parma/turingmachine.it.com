import { bool, Optional } from "./utils.js";

export class Result<T = void> {
    value: Optional<T>;
    error: Optional<Error>;
    constructor(value?: T, error?: Error) {
        this.value = value ?? null;
        this.error = error ?? null;
    }

    static ok(): Result<void>;
    static ok<T>(value?: T): Result<T>;
    static ok<T>(value?: T): Result<T> {
        return new Result(value);
    }

    static err<T>(message: string): Result<T> {
        return new Result<T>(undefined, new Error(message));
    }

    isOk(): bool { return !this.error; }
    isErr(): bool { return !!this.error; }

    unwrapOr(value: T): T {
        return this.value ?? value;
    }
}
