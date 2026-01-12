import { Description } from "./description/description.js";
import { Action, Move, State } from "./description/action.js";
import { Symbol, Tape } from "./tape.js";
import { bool, Optional } from "./utils/utils.js";
import { assert } from "./utils/assert.js";

// TODO: for animations, separate move and write as two separate actions
// TODO: add backwards step
export class Machine {
    description: Description
    state: State;
    tape: Tape;
    halted: bool;
    constructor(description: Description, input: Symbol[]) {
        this.description = description
        this.state = description.startState;
        this.tape = new Tape(input, this.description.blank);
        this.halted = false;
    }

    changeInput(input: Symbol[]) {
        this.state = this.description.startState
        this.tape = new Tape(input, this.description.blank)
        this.halted = false;
    }

    step() {
        if (this.halted) {
            return;
        }

        const action = this.getAction();
        console.log(action)
        if (action === null || action.isEndAction()) {
            this.halted = true;
            return;
        }

        if (action.write !== null) {
            this.tape.write(action.write)
        }

        switch (action.move) {
            case Move.Left:
                this.tape.moveLeft();
                break;
            case Move.Right:
                this.tape.moveRight();
                break;
            case Move.None:
                break;
        }

        if (action.nextState !== "") {
            this.state = action.nextState;
        }
    }

    getAction(): Optional<Action> {
        const column = this.description.table.get(this.state);
        assert(column !== undefined);

        const symbol = this.tape.read();
        const action = column.get(symbol);
        if (action === undefined) {
            return null;
        }

        return action;
    }
}

