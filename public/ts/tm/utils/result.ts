import { assert } from "./assert.js"
import { bool, Optional } from "./utils.js"


export class Result<T = void> {
    value: Optional<T>
    error: Optional<Error>
    constructor(value?: T, error?: Error) {
        this.value = value ?? null
        this.error = error ?? null
    }

    static ok(): Result<void>
    static ok<T>(value?: T): Result<T>
    static ok<T>(value?: T): Result<T> {
        return new Result(value)
    }

    static err<T>(error: string | Error): Result<T> {
        const err = typeof error === "string" ? new Error(error) : error
        return new Result<T>(undefined, err)
    }

    isOk(): bool { return !this.error }
    isErr(): bool { return !!this.error }

    getValue(): T {
        return this.value!
    }

    getError(): Error {
        return this.error!
    }

    unwrapOr(value: T): T {
        return this.value ?? value
    }

    cast<U>(): Result<U> {
        assert(this.isErr(), "cannot cast result with a value to a different error type")
        return Result.err<U>(this.error!)
    }
}
