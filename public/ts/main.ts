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
    undoButton: HTMLButtonElement,
    playButton: HTMLButtonElement
    pauseButton: HTMLButtonElement
    executeButton: HTMLButtonElement,
    yamlInput: HTMLTextAreaElement
    loadYamlButton: HTMLButtonElement,
    tapeInput: HTMLInputElement
    loadTapeButton: HTMLButtonElement,
    tapeDisplay: HTMLDivElement
    stateDisplay: HTMLSpanElement
    headDisplay: HTMLSpanElement
}

window.addEventListener("load", () => {
    loadElements()
    bindEvents()
    initialized = true
    loadMachine()
})

function loadElements() {
    ui = {
        undoButton: getElement("undoButton"),
        playButton: getElement("playButton"),
        pauseButton: getElement("pauseButton"),
        executeButton: getElement("executeButton"),
        yamlInput: getElement("yamlInput"),
        loadYamlButton: getElement("loadYamlButton"),
        tapeInput: getElement("tapeInput"),
        loadTapeButton: getElement("loadTapeButton"),
        tapeDisplay: getElement("tapeDisplay"),
        stateDisplay: getElement("stateDisplay"),
        headDisplay: getElement("headDisplay"),
    }
}

function bindEvents() {
    onClick("undoButton", undo)
    onClick("playButton", play)
    onClick("pauseButton", stopPlaying)
    onClick("executeButton", execute)
    onClick("loadYamlButton", loadMachine)
    onClick("loadTapeButton", loadTape)
}

function reportError(error: any) {
    console.log(error)
}

function isInitialized(): bool {
    return tm !== undefined && initialized === true
}

function isPlaying(): bool {
    return playInterval !== undefined
}

function getElement<T>(id: keyof typeof ui): T {
    const element = document.getElementById(id)
    assert(element != null, "DOM element has to exist")
    return element! as T
}

function onClick(id: keyof typeof ui, handler: () => void) {
    ui[id].addEventListener("click", handler)
}

function readYaml(): string {
    return ui.yamlInput.value
}

function readInput(): string {
    return ui.tapeInput.value
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

function loadTape() {
    if (!isInitialized()) {
        reportError("Load machine first")
        return
    }
    tm.loadTape(readInput())
    updateDisplay(tm)
}

function undo() {
    if (!isInitialized()) {
        reportError("Load machine first")
        return
    }
    if (isPlaying()) return

    tm.back()
    updateDisplay(tm)
}

function execute() {
    if (!isInitialized()) {
        reportError("Load machine first")
        return
    }
    if (isPlaying()) return

    tm.step()
    updateDisplay(tm)
}

function play() {
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
}

function startPlaying() {
    ui.playButton.classList.add("hidden")
    ui.pauseButton.classList.remove("hidden")
    ui.undoButton.disabled = true
    ui.executeButton.disabled = true
}

function stopPlaying() {
    clearInterval(playInterval)
    playInterval = undefined
    ui.playButton.classList.remove("hidden")
    ui.pauseButton.classList.add("hidden")
    ui.undoButton.disabled = false
    ui.executeButton.disabled = false
}

function updateDisplay(machine: Machine) {
    updateCellsDisplay(machine)
    updateIndicatorsDisplay(machine)
}

// TODO: refactor
function updateCellsDisplay(machine: Machine) {
    ui.tapeDisplay.innerHTML = ""

    for (let i = 0; i <= machine.tape.cells.length; i++) {
        const cellVal = machine.tape.cells[i]
        if (cellVal == null) { return }
        const cellEl = document.createElement("div")
        cellEl.className = `tape-cell ${i === machine.tape.head ? 'active' : ''}`
        cellEl.textContent = cellVal
        ui.tapeDisplay.appendChild(cellEl)

        // Scroll the active cell into view
        if (i === machine.tape.head) {
            cellEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
    }
}

function updateIndicatorsDisplay(machine: Machine) {
    ui.stateDisplay.textContent = machine.state
    ui.headDisplay.textContent = String(machine.tape.head)
}

