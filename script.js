import { CodeGen } from './codegen.js';

let gen = new CodeGen({ function_wrap: true });
console.log("Loaded");

const html_area = document.getElementById("html_area");
const js_area = document.getElementById("js_area");
const stub = document.getElementById("stub");

html_area.addEventListener("input", (event) => {
    let html = html_area.value;

    let code = gen.generate(ex);

    if (code !== "") {
        js_area.value = code;
    }
})

// const ex = `<h2 onclick="alert('bar');" w=king>The href Attribute</h2>`;
const ex = `<h2 onclick="alert('bar');" w=king><p s=k>The href Attribute</p></h2>`;
// const ex = `<img src="x" onerror="alert()">`;
// const ex = `hello`;
