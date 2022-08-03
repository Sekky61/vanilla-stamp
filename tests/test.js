import { CodeGen } from '../codegen.js';

// Testing framework

function it(desc, fn) {
    // Run function
    let success = true;
    try {
        fn();
    } catch (error) {
        success = false;
    }

    // Report to console
    if (success) {
        console.log('\x1b[32m%s\x1b[0m', '\u2714 ' + desc);
    } else {
        console.log('\n');
        console.log('\x1b[31m%s\x1b[0m', '\u2718 ' + desc);
        console.error(error);
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

    assert(code === null);
});

it('h2 with two attributes', function () {
    let gen = new CodeGen({ function_wrap: true });
    let code = gen.generate(`<h2 onclick="alert('bar');" w=king>The href Attribute</h2>`);

    let result = execute(code);

    assert(result instanceof HTMLElement);
    assert(result.nodeName === "H2");
    assert(result.children.length === 0);
    assert(has_exactly_attributes(result, [["onclick", "alert('bar');"], ["w", "king"]]));
});

it('p with text', function () {
    let gen = new CodeGen({ function_wrap: true });
    let code = gen.generate(`<p>The text 😎</p>`);

    let result = execute(code);

    assert(result instanceof HTMLElement);
    assert(result.nodeName === "P");
    assert(result.children.length === 0);
    assert(has_exactly_attributes(result, []));
});
