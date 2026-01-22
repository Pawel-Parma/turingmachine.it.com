import { descriptionFromYaml } from "./tm/description/yaml.js"
import { Machine } from "./tm/machine.js"


let machine: Machine | undefined


function onClick(id: string, handler: () => void) {
    document.getElementById(id)!.addEventListener("click", handler)
}


window.addEventListener("load", () => {
    newMachine()
    updateDisplay()
})


onClick("loadYamlButton", () => {
    newMachine()
    updateDisplay()
})

onClick("loadTapeButton", () => {
    if (!machine) return
    machine.loadTape(getInput())
    updateDisplay()
})

onClick("stepButton", () => {
    if (!machine) return
    machine.step()
    updateDisplay()
})

onClick("backButton", () => {
    if (!machine) return
    machine.back()
    updateDisplay()
})


function readYaml(): string {
    const yamlInput = document.getElementById("yamlInput") as HTMLTextAreaElement
    return yamlInput.value
}

function getInput(): string[] {
    const tapeInput = document.getElementById("tapeInput") as HTMLInputElement
    return tapeInput.value.split("")
}

function newMachine() {
    const rawYaml = readYaml()
    var descriptionResult = descriptionFromYaml(rawYaml)
    if (descriptionResult.isErr()) {
        console.log(descriptionResult.error)
        return
    }
    const description = descriptionResult.getValue()

    var verifyResult = description.verifyTransitionTable()
    if (verifyResult.isErr()) {
        console.log(verifyResult.error)
        return
    }

    machine = new Machine(description)
    machine.loadTape(getInput())
}

// TODO: refactor
function updateDisplay() {
    if (!machine) return

    const tapeDiv = document.getElementById("tapeDisplay")!
    const stateDiv = document.getElementById("stateDisplay")!
    const headDiv = document.getElementById("headDisplay")!

    // Create graphical cells
    tapeDiv.innerHTML = ""
    // Show a window of cells around the head for better visibility
    const displayCells = machine.tape.cells
    const maxIdx = Math.max(displayCells.length - 1, machine.tape.head + 5)

    for (let i = 0; i <= maxIdx; i++) {
        const cellVal = displayCells[i] || "_"
        const cellEl = document.createElement("div")
        cellEl.className = `tape-cell ${i === machine.tape.head ? 'active' : ''}`
        cellEl.textContent = cellVal
        tapeDiv.appendChild(cellEl)

        // Scroll the active cell into view
        if (i === machine.tape.head) {
            cellEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
    }

    stateDiv.textContent = machine.state
    headDiv.textContent = String(machine.tape.head)
}

