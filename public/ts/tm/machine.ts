import { Action, Move, State } from "./description/action.js"
import { Description } from "./description/description.js"
import { Symbol, Tape } from "./tape.js"
import { assert } from "./utils/assert.js"
import { bool, Optional } from "./utils/utils.js"

type HistoryEntry = {
    state: State
    head: number
    write: Optional<Symbol>
}

export class Machine {
    description: Description
    state: State
    tape: Tape
    halted: bool
    history: HistoryEntry[]
    constructor(description: Description, input: Symbol[]) {
        this.description = description
        this.state = description.startState
        this.tape = new Tape(input, this.description.blank)
        this.halted = false
        this.history = []
    }

    changeInput(input: Symbol[]) {
        this.state = this.description.startState
        this.tape = new Tape(input, this.description.blank)
        this.halted = false
    }

    step() {
        if (this.halted) {
            return
        }

        const action = this.getAction()
        console.log(action)
        if (action === null || action.isEndAction()) {
            this.halted = true
            return
        }

        const diff: HistoryEntry = {
            state: this.state,
            head: this.tape.head,
            write: this.tape.read(),
        }
        this.history.push(diff)

        if (action.write !== null) {
            this.tape.write(action.write)
        }

        switch (action.move) {
            case Move.Left: this.tape.moveLeft(); break
            case Move.Right: this.tape.moveRight(); break
            case Move.None: break
        }

        if (action.nextState !== "") {
            this.state = action.nextState
        }
    }

    back() {
        const last = this.history.pop()
        if (!last) return

        this.state = last.state
        this.tape.head = last.head
        if (last.write !== null) {
            this.tape.write(last.write)
        }

        this.halted = false
    }

    getAction(): Optional<Action> {
        const column = this.description.table.get(this.state)
        assert(column !== undefined)

        const symbol = this.tape.read()
        const action = column.get(symbol)
        if (action === undefined) {
            return null
        }

        return action
    }
}

