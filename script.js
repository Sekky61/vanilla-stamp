import { CodeGen } from './codegen.js';

console.log("Loaded");

const html_area = document.getElementById("html_area");
const js_area = document.getElementById("js_area");
const stub = document.getElementById("stub");

html_area.addEventListener("input", (event) => {
    let html = html_area.value;

    let gen = new CodeGen({ function_wrap: true });
    let code = gen.generate(html);

    if (code !== "") {
        js_area.value = code;
    }
})

// Clipboard copy

const copy_code = document.getElementById("copy_code");
copy_code.addEventListener("click", (e) => {
    let code = js_area.value;

    navigator.clipboard.writeText(code).then(function () {
        console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
        console.error('Async: Could not copy text: ', err);
    });
});

// Samples

const samples = {
    sample_1: {
        input: `<h2 onclick="alert('bar');" w=king>The href Attribute</h2>`
    },
    sample_2: {
        input: `<div class="right">
    <div class="js_area_cont">
        <textarea name="a2" id="js_area" cols="60" rows="20" readonly></textarea>
        <button id="copy_code">Copy</button>
    </div>
    <div class="gen_options"></div>
</div>`
    },
    sample_3: {
        input: `<h2 onclick="alert('bar');" w=king>The href Attribute</h2>`
    }
}

const sample_buttons = document.getElementById("samples");
sample_buttons.addEventListener("click", (e) => {
    let target_id = e.target.id;

    // Is a sample associated with this ID?
    if (target_id in samples) {
        let sample_input = samples[target_id].input;
        html_area.value = sample_input;

        // Dispatch event to update generated code
        let event = new InputEvent("input");
        html_area.dispatchEvent(event);
    } else {
        console.error(`Sample ${target_id} not found.`);
    }
})
