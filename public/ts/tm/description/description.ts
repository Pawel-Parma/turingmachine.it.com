import { Symbol } from "../tape.js"
import { Action, State } from "./action.js"
import { Result } from "../utils/result.js"

export type Column = Map<Symbol, Action>
export type TransitionTable = Map<State, Column>

export class Description {
    table: TransitionTable;
    startState: State;
    blank: Symbol;

    constructor(table: TransitionTable, startState: State, blank: Symbol) {
        this.table = table;
        this.startState = startState;
        this.blank = blank;
    }

    verifyTransitionTable(): Result<void> {
        if (!this.table.has(this.startState)) {
            return Result.err(`Start state '${this.startState}' does not exist`);
        }

        for (const [state, column] of this.table) {
            for (const [symbol, action] of column) {
                if (action.nextState == "") {
                    continue;
                }

                if (!this.table.has(action.nextState)) {
                    return Result.err(`Transition from state: '${state}' on symbol: '${symbol}' points to non-existent state: ${action.nextState}`);
                }
            }
        }

        return Result.ok();
    }

    unreferencedStates(): State[] {
        const allStates = new Set<State>(this.table.keys());

        const usedStates = new Set<State>();
        for (const [_, column] of this.table) {
            for (const [_, action] of column) {
                usedStates.add(action.nextState);

            }
        }

        const unusedStates = new Set<State>();
        for (const state of allStates) {
            if (state !== this.startState && !usedStates.has(state)) {
                unusedStates.add(state);
            }
        }


        return Array.from(unusedStates);
    }
}

