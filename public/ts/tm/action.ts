import { bool, Optional } from "./utils/types.js"


export type TSymbol = string
export type State = string
export enum Move {
    Left = "L",
    Right = "R",
    None = "N",
}

export const validMoves = [Move.Left, Move.Right, Move.None] as const
export const validMovesInfo = `Valid moves: ${validMoves.join(", ")}`

export class Action {
    constructor(
        public write: Optional<TSymbol>,
        public move: Move,
        public nextState: Optional<State>
    ) { }

    equal(other: Action): bool {
        return this.write === other.write && this.move === other.move && this.nextState === other.nextState
    }

    isHalt(): bool {
        return this.write === null && this.move === Move.None && this.nextState === null
    }
}

