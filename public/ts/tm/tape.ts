export type Symbol = string


export class Tape {
    cells: Symbol[]
    blank: Symbol
    head: number
    constructor(input: Symbol[], blank: Symbol) {
        this.cells = input.slice()
        this.blank = blank
        this.head = 0
    }

    read(): Symbol {
        return this.cells[this.head]!
    }

    write(symbol: Symbol) {
        this.cells[this.head] = symbol
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

