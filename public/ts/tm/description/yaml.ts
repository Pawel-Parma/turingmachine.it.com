import { Symbol } from "../tape.js"
import { Result } from "../utils/result.js"
import { Optional } from "../utils/utils.js"
import { Action, Move, State } from "./action.js"
import { Column, Description } from "./description.js"


const validMoves = [Move.Left, Move.Right, Move.None]

// TODO: implement yaml
// add format definition to action, format SYMBOL: MOVE, SYMBOL: { WRITE, MOVE, NEXTSTATE }, 
// SYMBOL: { write: WRITE, move: MOVE, nextState: NEXTSTATE }, 
export function descriptionFromYaml(yaml: any): Result<Description> {
    const startState = String(yaml.startState) as State
    const blank = String(yaml.blank) as Symbol

    const table = new Map<State, Column>()
    for (const state in yaml.table) {
        const column = yaml.table[state]
        table.set(state, new Map<Symbol, Action>())
        for (const symbol in column) {
            const raw = column[symbol]

            var write: Optional<Symbol> = null
            var move: Move = Move.None
            var nextState: State = ""

            if (typeof raw === "string") {
                if (!validMoves.includes(raw as Move)) {
                    return Result.err(`1 Invalid move: '${raw}' for symbol: '${symbol}' in state: '${state}'. Valid moves: ${validMoves.join(", ")}`)
                }
                move = raw as Move
            } /* else if (Array.isArray(raw)) {
                if (raw.length < 1 || 3 < raw.length) {
                    return Result.err(`Invalid action array length (${raw.length}) for symbol: '${symbol}' in state: '${state}'`)
                }

                const moveIdx = raw.length === 1 ? 0 : 1

                if (!validMoves.includes(raw[moveIdx])) {
                    return Result.err(`2 Invalid move: '${raw[moveIdx]}' for symbol: '${symbol}' in state: '${state}'. Valid moves: ${validMoves.join(", ")}`)
                }
                move = raw[moveIdx] as Move

                if (raw.length >= 2) {
                    write = String(raw[0])
                }

                if (raw.length === 3) {
                    nextState = String(raw[2])
                }
            } */ else if (typeof raw === "object") {
                write = raw.write === undefined ? null : String(raw.write)

                if (!validMoves.includes(raw.move)) {
                    return Result.err(`3 Invalid move: '${raw.move}' for symbol: '${symbol}' in state: '${state}'. Valid moves: ${validMoves.join(", ")}`)
                }
                move = raw.move as Move

                nextState = raw.nextState === undefined ? "" : String(raw.nextState)
            } else {
                return Result.err(`Invalid action format for symbol '${symbol}' in state '${state}'`)
            }

            table.get(state)!.set(symbol, new Action(write, move, nextState))
        }
    }

    return Result.ok(new Description(table, startState, blank))
}




