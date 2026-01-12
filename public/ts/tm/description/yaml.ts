import { Action, Move, State } from "./action.js";
import { Symbol } from "../tape.js";
import { Column, Description } from "./description.js";


// TODO: error handling
// TODO: fix ai slop
export function descriptionFromYaml(yaml: any): Description {
    const startState = yaml.startState as State;
    const blank = yaml.blank as Symbol;

    const table = new Map<State, Column>();
    for (const state in yaml.table) {
        const stateMap = yaml.table[state];
        table.set(state, new Map<Symbol, Action>());

        for (const symbol in stateMap) {
            const rawAction = stateMap[symbol];
            const action = new Action("", Move.Left, "");
            action.write = rawAction.write ?? null;
            action.nextState = rawAction.nextState ?? "";
            action.move = rawAction.move === "L" ? Move.Left :
                rawAction.move === "R" ? Move.Right :
                    Move.None;
            table.get(state)!.set(symbol, action);
        }
    }

    return new Description(table, startState, blank);
}

