import { Action, Move, State, TSymbol, validMoves, validMovesInfo } from "../action.js"
import { assert } from "../utils/assert.js"
import { Result } from "../utils/result.js"
import { Optional } from "../utils/types.js"
import { Description, Row, defualtBlank } from "./description.js"

export function descriptionFromYaml(rawYaml: string): Result<Description> {
    const yaml: any = jsyaml.load(rawYaml)
    if (yaml == null) {
        return Result.err("No input provided")
    }
    const blank = String(yaml.blank ?? defualtBlank)

    if (yaml.startState === null || yaml.startState === undefined) {
        return Result.err("startState has to have a value")
    }
    // TODO: support also "start state"
    const startState = String(yaml.startState)

    const table = new Map<State, Row>()
    for (const state in yaml.table) {
        const row = yaml.table[state]

        table.set(state, new Map<TSymbol, Action>())
        for (const symbol in row) {
            const locMsg = `for symbol '${symbol}' in state '${state}'`

            const raw = row[symbol]
            if (raw == null) {
                return Result.err(`Invalid action format ${locMsg}`)
            }

            var parse: (raw: any, locMsg: string) => Result<Action> = parseArray
            if (typeof raw === "string") {
                parse = parseSingle
            } else if (Array.isArray(raw)) {
                parse = parseArray
            } else if (typeof raw === "object" && "move" in raw) {
                parse = parseNew
            } else if (typeof raw === "object") {
                parse = parseLegacy
            } else {
                return Result.err(`Invalid action format ${locMsg}`)
            }


            const res = parse(raw, locMsg)
            if (res.isErr()) return res.cast()
            const action = res.getValue()
            assert(action !== null, "action cannot be null after parsing")
            table.get(state)!.set(symbol, action)
        }
    }

    return Result.ok(new Description(table, startState, blank))
}

function parseMove(raw: any, locMsg: string): Result<Move> {
    if (!validMoves.includes(raw)) {
        return Result.err(`Invalid move: '${raw}' ${locMsg}. ${validMovesInfo} `)
    }
    return Result.ok(raw as Move)
}

function parseSingle(raw: any, locMsg: string): Result<Action> {
    const res = parseMove(raw, locMsg)
    if (res.isErr()) return res.cast()
    const move = res.getValue()
    return Result.ok(new Action(null, move, null))
}

function parseArray(raw: any[], locMsg: string): Result<Action> {
    if (raw.length < 1 || 3 < raw.length) {
        return Result.err(`Invalid array action format ${locMsg}`)
    }

    if (raw.length === 1) {
        return parseSingle(raw[0], locMsg)
    }

    // TODO: infer whether [ write, move ] or [ move, nextState ]
    // via parsing both as move and when 
    //   both succed return ambiguity error (nextState can also be named L, R, N) if len == 2
    //   none succed return no move error
    //   left succeds and right not assume [ move, nextState ] and error if len == 3 bc then right must succed
    //   right succeds and left not assume [ write, move ] and continue with what logic is now
    const write = raw[0] == null ? null : String(raw[0])
    const res = parseMove(raw[1], locMsg)
    if (res.isErr()) return res.cast()
    const move = res.getValue()


    var nextState: Optional<State> = null
    if (raw.length === 3) {
        nextState = raw[2] == null ? null : String(raw[2])
    }

    return Result.ok(new Action(write, move, nextState))
}


function parseNew(raw: any, locMsg: string): Result<Action> {
    const write = raw.write == null ? null : String(raw.write)
    const res = parseMove(raw.move, locMsg)
    if (res.isErr()) return res.cast()
    const move = res.getValue()
    const nextState = raw.nextState == null ? null : String(raw.nextState)
    return Result.ok(new Action(write, move, nextState))
}

function parseLegacy(raw: any, locMsg: string): Result<Action> {
    const write = raw.write == null ? null : String(raw.write)

    const moveKeys = Object.keys(raw).filter(k => k !== "write")
    if (moveKeys.length !== 1) {
        return Result.err(`Cannot determine move ${locMsg}. Found keys: ${moveKeys}. ${validMovesInfo}`)
    }
    const res = parseMove(moveKeys[0], locMsg)
    if (res.isErr()) return res.cast()
    const move = res.getValue()

    const moveKey = moveKeys[0]!
    const nextState = raw[moveKey] == null ? null : String(raw[moveKey])

    return Result.ok(new Action(write, move, nextState))
}
