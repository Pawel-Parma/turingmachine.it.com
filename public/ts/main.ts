import { descriptionFromYaml } from "./tm/description/yaml.js"
import { Machine } from "./tm/machine.js"
import { assert } from "./tm/utils/assert.js"
import { Result } from "./tm/utils/result.js"
import { bool } from "./tm/utils/types.js"


let initialized: bool = false
let tm: Machine = undefined!
let playInterval: number | undefined = undefined
let timeout = 750
let ui!: {
    playButton: HTMLButtonElement
    pauseButton: HTMLButtonElement
    yamlInput: HTMLTextAreaElement
    tapeInput: HTMLInputElement
    tape: HTMLDivElement
    state: HTMLSpanElement
    head: HTMLSpanElement
}

window.addEventListener("load", () => {
    loadElements()
    bindEvents()
    initialized = true

    loadMachine()
})

function loadElements() {
    ui = {
        playButton: getElement("playButton"),
        pauseButton: getElement("pauseButton"),
        yamlInput: getElement("yamlInput"),
        tapeInput: getElement("tapeInput"),
        tape: getElement("tapeDisplay"),
        state: getElement("stateDisplay"),
        head: getElement("headDisplay"),
    }
}

function getElement<T>(id: string): T {
    const element = document.getElementById(id)
    assert(element != null, "DOM element has to exist")
    return element! as T
}

function bindEvents() {
    onClick("loadYamlButton", loadMachine)

    onClick("loadTapeButton", () => {
        if (!isInitialized()) {
            reportError("Load machine first")
            return
        }
        tm.loadTape(readInput())
        updateDisplay(tm)
    })

    onClick("undoButton", () => {
        if (!isInitialized()) {
            reportError("Load machine first")
            return
        }
        tm.back()
        updateDisplay(tm)
    })

    onClick("executeButton", () => {
        if (!isInitialized()) {
            reportError("Load machine first")
            return
        }
        tm.step()
        updateDisplay(tm)
    })

    onClick("playButton", () => {
        if (!isInitialized()) {
            reportError("Load machine first")
            return
        }

        startPlaying()

        playInterval = setInterval(() => {
            tm.step()
            updateDisplay(tm)
            if (tm.halted) stopPlaying()
        }, timeout)
    })

    onClick("pauseButton", stopPlaying)
}

function onClick(id: string, handler: () => void) {
    document.getElementById(id)!.addEventListener("click", handler)
}

function reportError(error: any) {
    console.log(error)
}

function isInitialized(): bool {
    return tm !== undefined && initialized === true
}

function readYaml(): string {
    return ui.yamlInput.value
}

function readInput(): string {
    return ui.tapeInput.value
}

function loadMachine() {
    const res = newMachine()
    if (res.isErr()) {
        reportError(res.getError())
        return
    }
    tm = res.getValue()

    tm.loadTape(readInput())
    updateDisplay(tm)
}

function newMachine(): Result<Machine> {
    const rawYaml = readYaml()
    var descriptionResult = descriptionFromYaml(rawYaml)
    if (descriptionResult.isErr()) {
        return descriptionResult.cast()
    }
    const description = descriptionResult.getValue()

    var verifyResult = description.verifyTransitionTable()
    if (verifyResult.isErr()) {
        return verifyResult.cast()
    }

    return Result.ok(new Machine(description))
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

