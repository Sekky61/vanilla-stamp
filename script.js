console.log("Loaded");

const html_area = document.getElementById("html_area");
const js_area = document.getElementById("js_area");
const stub = document.getElementById("stub");

html_area.addEventListener("input", (event) => {
    console.log(event);
    console.dir(html_area.value);
    let html = html_area.value;

    const el = document.createElement("div");
    el.innerHTML = ex;
    console.dir(el);
    stub.appendChild(el);

    analyze(el)
})

function analyze(el) {
    console.log(`Children: ${el.children.length}`);
    let target = el.children[0];
    console.log(target);
    console.dir(target);

    console.log(target.attributes)

    // Start recursive iteration over children
    let ctx = gen_context();
    let js_code = generate_js(ctx, target);

    console.log("The code:")
    console.log(js_code);

    js_area.value = js_code;
}

function gen_context() {
    return {
        used_counter: {},
    }
}

function generate_js(ctx, el) {
    let el_code = generate_node(ctx, el);
    for (const child of el.children) {
        let child_js = generate_js(ctx, child);
        el_code = el_code.concat(child_js);
    }
    return el_code;
}

function generate_node(ctx, el) {
    let s = "";
    let var_name = get_var_name(ctx, el);
    s = s.concat(`let ${var_name} = document.createElement("${el.tagName}")\n`);
    for (const attr of el.attributes) {
        console.dir(attr)
        s = s.concat(`Attr ${attr.name} - ${attr.value}\n`);
    }
    return s;
}

function get_var_name(ctx, el) {
    let el_tag = el.tagName;
    let times_used = ctx.used_counter[el_tag];
    if (times_used === undefined) {
        ctx.used_counter[el_tag] = 1;
        times_used = 0;
    } else {
        ctx.used_counter[el_tag] += 1;
    }

    return `${el_tag}_${times_used}`;
}

const ex = `<h2 onclick="alert('bar');" w=king>The href Attribute</h2>`;
