import { Symbol } from "../tape.js"
import { bool, Optional } from "../utils/utils.js"


export type State = string
export enum Move {
    Left = "L",
    Right = "R",
    None = "N",
}


export class Action {
    write: Optional<Symbol>
    move: Move
    nextState: State

    constructor(write: Optional<Symbol>, move: Move, nextState: State) {
        this.write = write
        this.move = move
        this.nextState = nextState
    }

    equal(other: Action): bool {
        if ((this.write === null) != (other.write === null)) {
            return false
        }
        if (this.write !== null && this.write !== other.write) {
            return false
        };
        return this.move == other.move && this.nextState == other.nextState
    }


    isEndAction(): bool {
        return this.write == null && this.move == Move.None && this.nextState == ""
    }
}
