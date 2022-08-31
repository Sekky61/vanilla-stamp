import { CodeGen } from '../codegen.js';

// Testing framework

function it(desc, fn) {
    // Run function
    let success = true;
    let error_obj;
    try {
        fn();
    } catch (error) {
        error_obj = error;
        success = false;
    }

    // Report to console
    if (success) {
        console.log('\x1b[32m%s\x1b[0m', '\u2714 ' + desc);
    } else {
        console.log('\n');
        console.log('\x1b[31m%s\x1b[0m', '\u2718 ' + desc);
        console.error(error_obj);
    }

    // Report to DOM
    const clone = row_template.content.cloneNode(true);
    clone.querySelector(".test_desc").innerText = desc;

    let success_tag = clone.querySelector(".test_status");
    // todo apply class
    if (success) {
        success_tag.innerText = "Success";
        success_tag.classList.add("test_success");
    } else {
        success_tag.innerText = "Falied";
        success_tag.classList.add("test_failure");
    }
    tests_output.appendChild(clone);
}

const tests_output = document.querySelector("#tests_output");
const row_template = document.querySelector("#test_report_row");

function assert(condition) {
    if (!condition) {
        throw new Error();
    }
}

function assert_eq(o1, o2) {
    if (o1 !== o2) {
        throw new Error();
    }
}

function assert_ne(o1, o2) {
    if (o1 === o2) {
        throw new Error();
    }
}

// var is automatically a window property 
// (source: https://stackoverflow.com/questions/12743007/can-i-add-attributes-to-window-object-in-javascript)
var global;
function set_glob(v) {
    global = v;
}

// 
window.set_glob = set_glob;

// Checks if node has exactly the attributes described in attrs.
// If node has extra attributes not specified in attrs, returns false.
//
// Param node: instance of HTMLElement
// Param attrs: array of arrays [[attr_key, attr_val], [...], ...]
// Returns bool
function has_exactly_attributes(node, attrs) {
    if (!(node instanceof HTMLElement)) {
        console.error(`Node not an instance of HTMLElement`);
        return false;
    }

    if (!(attrs instanceof Array)) {
        console.error(`Attrs not an instance of array`);
        return false;
    }

    let n_of_actual_attrs = node.attributes.length;

    if (attrs.length !== n_of_actual_attrs) {
        return false;
    }

    for (const [key, value] of attrs) {
        let actual_attr = node.attributes[key];
        if (!actual_attr) {
            console.error(`Attribute ${key} not found`);
            return false;
        }
        if (actual_attr.value !== value) {
            console.error(`Attribute ${key}'s value not matching (${actual_attr.value} vs ${value})`);
            return false;
        }
    }

    return true;
}

// Param function_string is in the form of "function f() { ...code... }"
function execute(function_string) {
    // Last argument is function body
    let f = Function(`return ${function_string}();`);
    return f();
}

// Actual tests

it('should reject non-HTML', function () {
    let gen = new CodeGen();

    let code = gen.generate(`cheese`);

    assert_eq(code, null);
});

it('h2 with two attributes', function () {
    let gen = new CodeGen({ function_wrap: true });
    let code = gen.generate(`<h2 onclick="alert('bar');" w=king>The href Attribute</h2>`);

    let result = execute(code);

    assert(result instanceof HTMLElement);
    assert_eq(result.nodeName, "H2");
    assert_eq(result.children.length, 0)
    assert(has_exactly_attributes(result, [["onclick", "alert('bar');"], ["w", "king"]]));
});

it('p with text', function () {
    let gen = new CodeGen({ function_wrap: true });
    let code = gen.generate(`<p>The text 😎</p>`);

    let result = execute(code);

    assert(result instanceof HTMLElement);
    console.dir(result)
    console.log(`----${result.nodeName}`)
    assert_eq(result.nodeName, "P");
    assert_eq(result.children.length, 0);
    assert(has_exactly_attributes(result, []));
});

it('innerText with doublequote', function () {
    let gen = new CodeGen({ function_wrap: true });
    let code = gen.generate(`<h2>The "king"</h2>`);

    let result = execute(code);
    assert_eq(result.innerText, `The \"king\"`);
});

it('Inline JS works', function () {
    let gen = new CodeGen({ function_wrap: true });
    console.dir(document.querySelector('meta[name="secret"]').content);
    let code = gen.generate(`<h2 onclick="set_glob(document.querySelector('meta[name=&quot;secret&quot;]').content);" >The href Attribute</h2>`);

    let result = execute(code);
    const event = new Event('click');
    result.dispatchEvent(event);

    assert_eq(global, "secret_value");
});
