export var Move;
(function (Move) {
    Move[Move["Left"] = 0] = "Left";
    Move[Move["Right"] = 1] = "Right";
    Move[Move["None"] = 2] = "None";
})(Move || (Move = {}));
export class Action {
    constructor(write, move, nextState) {
        this.write = write;
        this.move = move;
        this.nextState = nextState;
    }
    equal(other) {
        if ((this.write === null) != (other.write === null)) {
            return false;
        }
        if (this.write !== null && this.write !== other.write) {
            return false;
        }
        ;
        return this.move == other.move && this.nextState == other.nextState;
    }
    isEndAction() {
        return this.write == null && this.move == Move.None && this.nextState == "";
    }
}
//# sourceMappingURL=action.js.map