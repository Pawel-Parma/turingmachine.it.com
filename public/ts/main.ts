import { descriptionFromYaml } from "./tm/description/yaml.js"
import { Machine } from "./tm/machine.js"
import { Optional } from "./tm/utils/types.js"


var tm: Optional<Machine> = null
var playInterval: number | undefined = undefined
var ui = {
    playButton: document.getElementById("playButton") as HTMLButtonElement,
    pauseButton: document.getElementById("pauseButton") as HTMLButtonElement,
    yamlInput: document.getElementById("yamlInput") as HTMLTextAreaElement,
    tapeInput: document.getElementById("tapeInput") as HTMLInputElement,
    tape: document.getElementById("tapeDisplay") as HTMLDivElement,
    state: document.getElementById("stateDisplay") as HTMLSpanElement,
    head: document.getElementById("headDisplay") as HTMLSpanElement,
}


function onClick(id: string, handler: () => void) {
    document.getElementById(id)!.addEventListener("click", handler)
}


window.addEventListener("load", loadMachine)

onClick("loadYamlButton", loadMachine)

onClick("loadTapeButton", () => {
    if (!tm) {
        reportError("Load machine first")
        return
    }
    tm.loadTape(readInput())
    updateDisplay(tm)
})

onClick("undoButton", () => {
    if (!tm) {
        reportError("Load machine first")
        return
    }
    tm.step()
    updateDisplay(tm)
})

onClick("executeButton", () => {
    if (!tm) {
        reportError("Load machine first")
        return
    }
    tm.back()
    updateDisplay(tm)
})

onClick("playButton", () => {
    if (!tm) {
        reportError("Load machine first")
        return
    }
    var timeout = 1

    startPlaying()

    playInterval = setInterval(() => {
        tm!.step()
        updateDisplay(tm!)
        if (tm!.halted) stopPlaying()
    }, timeout)
})

onClick("pauseButton", stopPlaying)

function reportError(error: any) {
    console.log(error)
}

function readYaml(): string {
    return ui.yamlInput.value
}

function readInput(): string {
    return ui.tapeInput.value
}

function loadMachine() {
    tm = newMachine()
    if (tm === null) {
        return
    }

    tm.loadTape(readInput())
    updateDisplay(tm)
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

function startPlaying() {
    ui.playButton.classList.add("hidden")
    ui.pauseButton.classList.remove("hidden")
}

function stopPlaying() {
    clearInterval(playInterval)
    ui.playButton.classList.remove("hidden")
    ui.pauseButton.classList.add("hidden")
}

function updateDisplay(machine: Machine) {
    updateCellsDisplay(machine)
    updateIndicatorsDisplay(machine)
}

// TODO: refactor
function updateCellsDisplay(machine: Machine) {
    ui.tape.innerHTML = ""

    for (let i = 0; i <= machine.tape.cells.length; i++) {
        const cellVal = machine.tape.cells[i]
        if (cellVal == null) { return }
        const cellEl = document.createElement("div")
        cellEl.className = `tape-cell ${i === machine.tape.head ? 'active' : ''}`
        cellEl.textContent = cellVal
        ui.tape.appendChild(cellEl)

        // Scroll the active cell into view
        if (i === machine.tape.head) {
            cellEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
    }
}

function updateIndicatorsDisplay(machine: Machine) {
    ui.state.textContent = machine.state
    ui.head.textContent = String(machine.tape.head)
}

