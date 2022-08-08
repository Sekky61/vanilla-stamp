import { CodeGen } from './codegen.js';

console.log("Loaded");

const html_area = document.getElementById("html_area");
const js_area = document.getElementById("js_area");

const gen_options = document.getElementById("gen_options");
const function_wrap_el = document.getElementById("function_wrap");
const indent_type_el = document.getElementById("indent_type");
const space_count_el = document.getElementById("space_count");

// Defaults
space_count_el.value = 4;
function_wrap_el.checked = true;

gen_options.addEventListener("change", gen_code);

html_area.addEventListener("input", gen_code);

function gen_code() {
    let html = html_area.value;

    // Get options
    let function_wrap = function_wrap_el.checked;
    let indent_type = indent_type_el.checked ? "tabs" : "spaces";
    console.dir(space_count_el)
    let space_count = space_count_el.valueAsNumber;
    console.log(`Gencode called, ${function_wrap}`);
    console.dir(function_wrap_el);

    let gen = new CodeGen({ function_wrap, indent_type, space_count });
    let code = gen.generate(html);

    if (code !== "") {
        js_area.value = code;
    }
}

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
    // If not, user probably clicked outside a button
    if (target_id in samples) {
        let sample_input = samples[target_id].input;
        html_area.value = sample_input;

        // Dispatch event to update generated code
        let event = new InputEvent("input");
        html_area.dispatchEvent(event);
    }
})
