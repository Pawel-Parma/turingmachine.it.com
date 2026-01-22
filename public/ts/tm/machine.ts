import { Action, State, TSymbol } from "./action.js"
import { Description } from "./description/description.js"
import { Tape } from "./tape.js"
import { assert } from "./utils/assert.js"
import { bool, Optional } from "./utils/types.js"

type HistoryEntry = {
    previousState: State
    previousHead: number
    previousSymbol: TSymbol
}

export class Machine {
    description: Description
    state: State
    tape: Tape
    halted: bool
    history: HistoryEntry[]
    constructor(description: Description) {
        this.description = description
        this.state = description.startState
        this.tape = new Tape([], this.description.blank)
        this.halted = true
        this.history = []
    }

    loadTape(cells: TSymbol[]) {
        this.state = this.description.startState
        this.tape = new Tape(cells, this.description.blank)
        this.halted = false
    }

    step() {
        if (this.halted) {
            return
        }

        const action = this.getAction()
        if (action === null || action.isHalt()) {
            this.halted = true
            return
        }

        this.history.push({
            previousState: this.state,
            previousHead: this.tape.head,
            previousSymbol: this.tape.read(),
        })

        if (action.write !== null) {
            this.tape.write(action.write)
        }

        this.tape.move(action.move)

        this.state = action.nextState ?? this.state
    }

    back() {
        const last = this.history.pop()
        if (!last) return

        this.state = last.previousState
        this.tape.head = last.previousHead
        this.tape.write(last.previousSymbol)

        this.halted = false
    }

    getAction(): Optional<Action> {
        const row = this.description.table.get(this.state)
        assert(row !== undefined, "row cannot be undefined")

        const symbol = this.tape.read()
        const action = row.get(symbol)

        return action ?? null
    }
}

