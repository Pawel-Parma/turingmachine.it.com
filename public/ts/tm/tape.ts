import { Move, TSymbol } from "./action.js"

export class Tape {
    cells: TSymbol[]
    blank: TSymbol
    head: number
    constructor(cells: TSymbol[], blank: TSymbol) {
        this.cells = cells.length === 0 ? [blank] : cells.slice()
        this.blank = blank
        this.head = 0
    }

    read(): TSymbol {
        console.log(this.cells[this.head]!)
        return this.cells[this.head]!
    }

    write(symbol: TSymbol) {
        this.cells[this.head] = symbol
    }

    move(move: Move) {
        switch (move) {
            case Move.Left: this.moveLeft(); break
            case Move.Right: this.moveRight(); break
            case Move.None: break
        }
    }

    moveLeft() {
        if (this.head == 0) {
            this.cells.unshift(this.blank)
        } else {
            this.head -= 1
        }
    }

    moveRight() {
        this.head += 1
        if (this.head == this.cells.length) {
            this.cells.push(this.blank)
        }
    }
}

