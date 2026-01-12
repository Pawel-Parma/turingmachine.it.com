export class Tape {
    constructor(input, blank) {
        this.cells = input.slice();
        this.blank = blank;
        this.head = 0;
    }
    read() {
        return this.cells[this.head];
    }
    write(symbol) {
        this.cells[this.head] = symbol;
    }
    moveLeft() {
        if (this.head == 0) {
            this.cells.unshift(this.blank);
        }
        else {
            this.head -= 1;
        }
    }
    moveRight() {
        this.head += 1;
        if (this.head == this.cells.length) {
            this.cells.push(this.blank);
        }
    }
}
//# sourceMappingURL=tape.js.map