import { Action, State, TSymbol } from "../action.js"
import { Result } from "../utils/result.js"


export const defaultBlank: TSymbol = "_"
export const defaultInputSeparator: string = ""
export const defaultInput: string = ""

export type Row = Map<TSymbol, Action>
export type TransitionTable = Map<State, Row>

export class Description {
    constructor(
        public table: TransitionTable,
        public startState: State,
        public blank: TSymbol,
        public inputSeparator: string,
        public input: string,
    ) { }

    verifyTransitionTable(): Result<void> {
        if (!this.table.has(this.startState)) {
            return Result.err(`Start state '${this.startState}' does not exist`)
        }

        for (const [state, row] of this.table) {
            for (const [symbol, action] of row) {
                if (action.nextState !== null && !this.table.has(action.nextState)) {
                    return Result.err(`Transition from state: '${state}' on symbol: '${symbol}' points to non-existent state: ${action.nextState}`)
                }
            }
        }

        return Result.ok()
    }

    unreferencedStates(): State[] {
        const allStates = new Set<State>(this.table.keys())

        const usedStates = new Set<State>()
        for (const [_, row] of this.table) {
            for (const [_, action] of row) {
                if (action.nextState !== null) {
                    usedStates.add(action.nextState)
                }
            }
        }

        const unusedStates = new Set<State>()
        for (const state of allStates) {
            if (state !== this.startState && !usedStates.has(state)) {
                unusedStates.add(state)
            }
        }

        return Array.from(unusedStates)
    }

    // TODO: simplyfy
}

