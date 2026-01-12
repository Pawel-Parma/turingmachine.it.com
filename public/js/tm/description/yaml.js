import { Action, Move } from "./action.js";
import { Description } from "./description.js";
// TODO: error handling
// TODO: fix ai slop
export function descriptionFromYaml(yaml) {
    var _a, _b;
    const startState = yaml.startState;
    const blank = yaml.blank;
    const table = new Map();
    for (const state in yaml.table) {
        const stateMap = yaml.table[state];
        table.set(state, new Map());
        for (const symbol in stateMap) {
            const rawAction = stateMap[symbol];
            const action = new Action("", Move.Left, "");
            action.write = (_a = rawAction.write) !== null && _a !== void 0 ? _a : null;
            action.nextState = (_b = rawAction.nextState) !== null && _b !== void 0 ? _b : "";
            action.move = rawAction.move === "L" ? Move.Left :
                rawAction.move === "R" ? Move.Right :
                    Move.None;
            table.get(state).set(symbol, action);
        }
    }
    return new Description(table, startState, blank);
}
//# sourceMappingURL=yaml.js.map