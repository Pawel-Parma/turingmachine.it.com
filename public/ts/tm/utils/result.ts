import { assert } from "./assert.js"
import { bool, Optional } from "./types.js"


export class Result<T = void> {
    value: Optional<T>
    error: Optional<Error>
    constructor(value: Optional<T>, error: Optional<Error>) {
        this.value = value
        this.error = error
    }

    static ok(): Result<void>
    static ok<T>(value: T): Result<T>
    static ok<T>(value?: T): Result<T> {
        return new Result(value ?? null, null)
    }

    static err<T>(error: string | Error): Result<T> {
        const err = typeof error === "string" ? new Error(error) : error
        return new Result<T>(null, err)
    }

    isOk(): bool { return !this.error }
    isErr(): bool { return !!this.error }

    getValue(): T {
        return this.value!
    }

    getError(): Error {
        return this.error!
    }

    addMsg(message: any, separator: string = ":"): Result<T> {
        assert(this.isErr(), "cannot add message to a result without an error")
        this.error = new Error(`${this.error!.message}${separator} ${message}`)
        return this
    }

    cast<U>(): Result<U> {
        assert(this.isErr(), "cannot cast result without an error to a different error type")
        return Result.err<U>(this.error!)
    }
}
