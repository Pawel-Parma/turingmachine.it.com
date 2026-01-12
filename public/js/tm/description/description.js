import { Result } from "../utils/result.js";
export class Description {
    constructor(table, startState, blank) {
        this.table = table;
        this.startState = startState;
        this.blank = blank;
    }
    verifyTransitionTable() {
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
    unreferencedStates() {
        const allStates = new Set(this.table.keys());
        const usedStates = new Set();
        for (const [_, column] of this.table) {
            for (const [_, action] of column) {
                usedStates.add(action.nextState);
            }
        }
        const unusedStates = new Set();
        for (const state of allStates) {
            if (state !== this.startState && !usedStates.has(state)) {
                unusedStates.add(state);
            }
        }
        return Array.from(unusedStates);
    }
}
//# sourceMappingURL=description.js.map