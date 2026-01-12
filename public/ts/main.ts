import { TransitionTable } from "./tm/description/description.js";
import { descriptionFromYaml } from "./tm/description/yaml.js";
import { Machine } from "./tm/machine.js";

let machine: Machine;

// TODO: logging
function updateDisplay() {
    const tapeDiv = document.getElementById("tapeDisplay")!;
    const stateDiv = document.getElementById("stateDisplay")!;
    const headDiv = document.getElementById("headDisplay")!;

    // Tape visualization with head
    const tapeStr = machine.tape.cells.map((s, i) => i === machine.tape.head ? `[${s}]` : ` ${s} `).join("");
    tapeDiv.textContent = tapeStr;
    stateDiv.textContent = machine.state;
    headDiv.textContent = String(machine.tape.head);
}

// Load YAML from textarea
document.getElementById("loadYamlBtn")!.addEventListener("click", () => {
    const yamlText = (document.getElementById("yamlInput") as HTMLTextAreaElement).value;
    const yamlObj = jsyaml.load(yamlText); // assume jsyaml is imported in yaml.ts

    const description = descriptionFromYaml(yamlObj); // you implement fromYaml
    const e = description.verifyTransitionTable();
    if (e.isErr()) {
        console.log(e.error)
    }
    machine = new Machine(description, [""]);

    console.log("YAML loaded, start state:", machine.state);
});

// Load tape input
document.getElementById("loadTapeBtn")!.addEventListener("click", () => {
    const input = (document.getElementById("tapeInput") as HTMLInputElement).value;
    machine.changeInput(input.split(""))
    updateDisplay();
});

// Step button
document.getElementById("stepBtn")!.addEventListener("click", () => {
    machine.step();
    updateDisplay();
});

export function printTransitionTable(tt: TransitionTable) {
    // Convert outer Map<State, Column> into object
    const tableObj: Record<string, Record<string, string>> = {};

    for (const [state, column] of tt) {
        const colObj: Record<string, string> = {};
        for (const [symbol, action] of column) {
            colObj[symbol] = `${action.write ?? "-"} / ${action.move} / ${action.nextState ?? "-"}`;
        }
        tableObj[state] = colObj;
    }

    console.table(tableObj);
}

