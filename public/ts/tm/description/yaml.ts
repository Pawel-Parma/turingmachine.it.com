import { Action, Move, State, TSymbol, validMoves, validMovesInfo } from "../action.js"
import { assert } from "../utils/assert.js"
import { Result } from "../utils/result.js"
import { Description, Row, defaultBlank, defaultInput, defaultInputSeparator } from "./description.js"

export function descriptionFromYaml(rawYaml: string): Result<Description> {
    const expandedYaml = expandYamlArrayKeys(rawYaml)
    if (expandedYaml.isErr()) return expandedYaml.cast()
    var yaml: any = null
    try {
        yaml = jsyaml.load(expandedYaml.getValue())
    } catch (e) {
        var error: any = e
        if (e instanceof Error) {
            error = e.message
        }

        return Result.err("Invalid yaml").addMsg(error).cast()
    }

    if (yaml == null) {
        return Result.err("No input provided")
    }

    if (yaml.startState == null && yaml["start state"] == null) {
        return Result.err("'startState' has to have a value")
    }
    if (yaml.startState != null && yaml["start state"] != null && yaml.startState != yaml["start state"]) {
        return Result.err("'startState' and 'start state' have different values")
    }
    const startState = String(yaml.startState == null ? yaml["start state"] : yaml.startState)

    const blank = String(yaml.blank ?? defaultBlank)
    const inputSeparator = String(yaml.inputSeparator ?? defaultInputSeparator)
    const input: string = String(yaml.input ?? defaultInput)
    // TODO: error on unexpected fields

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

    return Result.ok(new Description(table, startState, blank, inputSeparator, input))
}

function expandYamlArrayKeys(rawYaml: string): Result<string> {
    const lines = rawYaml.split("\n")
    const output: string[] = []

    for (let line of lines) {
        const arrayKeyMatch = line.match(/^(\s*)\[(.*)\]\s*:(.*)$/)
        if (!arrayKeyMatch) {
            output.push(line)
            continue
        }

        const indent = arrayKeyMatch[1] ?? ""
        const rawKeys = arrayKeyMatch[2]!.trim()
        const value = arrayKeyMatch[3]!.trim()

        const keys = rawKeys.split(",")
        for (const key of keys) {
            if (key === "") {
                return Result.err("Encountered multiple ',' in a row. If ',' is part of a symbol, quote it")
            }
            output.push(`${indent}${key.trim()}: ${value}`)
        }
    }

    return Result.ok(output.join("\n"))
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

    const r0m = parseMove(raw[0], locMsg)
    const r1m = parseMove(raw[1], locMsg)

    if (r0m.isOk() && r1m.isOk() && raw.length === 2) {
        return Result.err(`Cannot infer array format [ write, move ] or [ move, nextState ] in ${raw} ${locMsg}`)
    }

    if (r0m.isErr() && r1m.isErr()) {
        return Result.err(`No valid move found in array ${raw} ${locMsg}`)
    }

    if (r0m.isErr() && r1m.isOk() || raw.length === 3) {
        const write = raw[0] == null ? null : String(raw[0])
        if (r1m.isErr()) return r1m.cast()
        const move = r1m.getValue()
        const nextState = raw.length !== 3 || raw[2] == null ? null : String(raw[2])
        return Result.ok(new Action(write, move, nextState))
    }

    if (r0m.isOk() && r1m.isErr()) {
        const move = r0m.getValue()
        const nextState = raw[1] == null ? null : String(raw[1])
        return Result.ok(new Action(null, move, nextState))
    }

    return Result.err(`Unable to parse array action ${raw} ${locMsg}`)
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

