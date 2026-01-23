import { descriptionFromYaml } from "./tm/description/yaml.js"
import { Machine } from "./tm/machine.js"
import { Optional } from "./tm/utils/types.js"


let gMachine: Optional<Machine> = null


function onClick(id: string, handler: () => void) {
    document.getElementById(id)!.addEventListener("click", handler)
}


window.addEventListener("load", loadMachine)

onClick("loadYamlButton", loadMachine)

onClick("loadTapeButton", () => {
    if (!gMachine) {
        reportError("Load machine first")
        return
    }
    gMachine.loadTape(readInput(gMachine.description.inputSeparator))
    updateDisplay(gMachine)
})

onClick("stepButton", () => {
    if (!gMachine) {
        reportError("Load machine first")
        return
    }
    gMachine.step()
    updateDisplay(gMachine)
})

onClick("backButton", () => {
    if (!gMachine) {
        reportError("Load machine first")
        return
    }
    gMachine.back()
    updateDisplay(gMachine)
})

function reportError(error: any) {
    console.log(error)
}

function readYaml(): string {
    const yamlInput = document.getElementById("yamlInput") as HTMLTextAreaElement
    return yamlInput.value
}

function readInput(separator: string): string[] {
    const tapeInput = document.getElementById("tapeInput") as HTMLInputElement
    return tapeInput.value.split(separator)
}

function loadMachine() {
    if (readYaml() == "") {
        return
    }

    gMachine = newMachine()
    if (gMachine === null) {
        return
    }

    gMachine.loadTape(readInput(gMachine.description.inputSeparator))
    updateDisplay(gMachine)
}

function newMachine(): Optional<Machine> {
    const rawYaml = readYaml()
    var descriptionResult = descriptionFromYaml(rawYaml)
    if (descriptionResult.isErr()) {
        reportError(descriptionResult.getError())
        return null
    }
    const description = descriptionResult.getValue()

    var verifyResult = description.verifyTransitionTable()
    if (verifyResult.isErr()) {
        reportError(verifyResult.getError())
        return null
    }

    return new Machine(description)
}

function updateDisplay(machine: Machine) {
    updateCellsDisplay(machine)
    updateIndicatorsDisplay(machine)
}

// TODO: refactor
function updateCellsDisplay(machine: Machine) {
    const tapeDiv = document.getElementById("tapeDisplay")!
    tapeDiv.innerHTML = ""

    for (let i = 0; i <= machine.tape.cells.length; i++) {
        const cellVal = machine.tape.cells[i]
        if (cellVal == null) { console.log("AA"); return }
        const cellEl = document.createElement("div")
        cellEl.className = `tape-cell ${i === machine.tape.head ? 'active' : ''}`
        cellEl.textContent = cellVal
        tapeDiv.appendChild(cellEl)

        // Scroll the active cell into view
        if (i === machine.tape.head) {
            cellEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
    }
}

function updateIndicatorsDisplay(machine: Machine) {
    const stateDiv = document.getElementById("stateDisplay")!
    stateDiv.textContent = machine.state

    const headDiv = document.getElementById("headDisplay")!
    headDiv.textContent = String(machine.tape.head)
}
