import { TransitionTable } from "./tm/description/description.js"
import { descriptionFromYaml } from "./tm/description/yaml.js"
import { Machine } from "./tm/machine.js"

let machine: Machine | undefined

// TODO: logging
// TODO: refactor  
function updateDisplay() {
    if (!machine) {
        return
    }

    const tapeDiv = document.getElementById("tapeDisplay")!
    const stateDiv = document.getElementById("stateDisplay")!
    const headDiv = document.getElementById("headDisplay")!

    // Tape visualization with head
    const tapeStr = machine.tape.cells.map((s, i) => i === machine!.tape.head ? `[${s}]` : ` ${s} `).join("")
    tapeDiv.textContent = tapeStr
    stateDiv.textContent = machine.state
    headDiv.textContent = String(machine.tape.head)
}

// Load YAML from textarea
document.getElementById("loadYamlBtn")!.addEventListener("click", () => {
    const yamlText = (document.getElementById("yamlInput") as HTMLTextAreaElement).value
    const yamlObj = jsyaml.load(yamlText) // assume jsyaml is imported in yaml.ts

    var e = descriptionFromYaml(yamlObj) // you implement fromYaml
    if (e.isErr()) {
        console.log(e.error)
        return
    }
    const description = e.getValue()
    var ev = description.verifyTransitionTable()
    if (ev.isErr()) {
        console.log(ev.error)
        return
    }
    machine = new Machine(description, [""])

    console.log("YAML loaded, start state:", machine.state)
})

// Load tape input
document.getElementById("loadTapeBtn")!.addEventListener("click", () => {
    if (!machine) {
        return
    }
    const input = (document.getElementById("tapeInput") as HTMLInputElement).value
    machine.changeInput(input.split(""))
    updateDisplay()
})

// Step button
document.getElementById("stepBtn")!.addEventListener("click", () => {
    if (!machine) {
        return
    }
    machine.step()
    updateDisplay()
})


document.getElementById("backBtn")!.addEventListener("click", () => {
    if (!machine) {
        return
    }
    machine.back()
    updateDisplay()
})

export function printTransitionTable(tt: TransitionTable) {
    // Convert outer Map<State, Column> into object
    const tableObj: Record<string, Record<string, string>> = {}

    for (const [state, column] of tt) {
        const colObj: Record<string, string> = {}
        for (const [symbol, action] of column) {
            colObj[symbol] = `${action.write ?? "-"} / ${action.move} / ${action.nextState ?? "-"}`
        }
        tableObj[state] = colObj
    }

    console.table(tableObj)
}

