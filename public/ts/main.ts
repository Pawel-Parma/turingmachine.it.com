import { descriptionFromYaml } from "./tm/description/yaml.js"
import { Machine } from "./tm/machine.js"


let machine: Machine | undefined

document.getElementById("loadYamlButton")!.addEventListener("click", () => {
    const rawYaml = (document.getElementById("yamlInput") as HTMLTextAreaElement).value
    const yaml = jsyaml.load(rawYaml)

    var resDescriptionFromYaml = descriptionFromYaml(yaml)
    if (resDescriptionFromYaml.isErr()) {
        console.log(resDescriptionFromYaml.error)
        return
    }
    const description = resDescriptionFromYaml.getValue()

    var verifyTransitionTable = description.verifyTransitionTable()
    if (verifyTransitionTable.isErr()) {
        console.log(verifyTransitionTable.error)
        return
    }

    machine = new Machine(description, getInput())
})

document.getElementById("loadTapeButton")!.addEventListener("click", () => {
    if (!machine) {
        return
    }
    machine.changeInput(getInput())
    updateDisplay()
})

document.getElementById("stepButton")!.addEventListener("click", () => {
    if (!machine) {
        return
    }
    machine.step()
    updateDisplay()
})

document.getElementById("backButtion")!.addEventListener("click", () => {
    if (!machine) {
        return
    }
    machine.back()
    updateDisplay()
})

function updateDisplay() {
    if (!machine) {
        return
    }
    const m = machine

    const tapeDiv = document.getElementById("tapeDisplay")!
    const stateDiv = document.getElementById("stateDisplay")!
    const headDiv = document.getElementById("headDisplay")!

    const tapeStr = m.tape.cells
        .map((s, i) => i === m.tape.head ? `[${s}]` : ` ${s} `)
        .join("")
    tapeDiv.textContent = tapeStr
    stateDiv.textContent = machine.state
    headDiv.textContent = String(m.tape.head)
}

function getInput() {
    const raw = (document.getElementById("tapeInput") as HTMLInputElement).value.trim()

    if (raw.includes(",")) {
        return raw.split(",").map(s => s.trim()).filter(s => s.length > 0)
    } else if (raw.includes(" ")) {
        return raw.split(" ").map(s => s.trim()).filter(s => s.length > 0)
    } else {
        return raw.split("")
    }
}

