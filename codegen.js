// JS generating class
export class CodeGen {

    // Options:
    // function_wrap - bool - if true, generated code will be inside a function
    constructor(options = {}) {

        this.used_counter = {};

        // TODO indent spaces/tabs (and number of them)

        // TODO maybe just save options object
        if ('function_wrap' in options) {
            let val = options.function_wrap;
            if (typeof val === "boolean") {
                this.function_wrap = val;
            }
        } else {
            this.function_wrap = false;
        }
    }

    reset_context() {
        this.used_counter = {};
    }

    // Param html_string: string, HTML snippet
    // Returns code
    // If html_string is not well-formed, returns null
    generate(html_string) {
        this.reset_context();

        // Use innerHTML to parse input
        const temp = document.createElement("template"); // todo can documentFragment be used?
        temp.innerHTML = html_string;
        let template_content = temp.content;

        // TODO revisit - can 2+ root nodes be allowed?
        console.dir(template_content);
        if (template_content.children.length !== 1) {
            // Input doesn't have one root node
            return null;
        }

        let target = template_content.firstElementChild; // The root node of input html

        if (!target) {
            console.log("Parsing error");
            return null;
        }

        let output = "";

        // Optionally wrap code in function
        if (this.function_wrap) {
            output = output.concat("function f() {\n");
        }

        let code = this.analyze(target);
        output = output.concat(code);

        // Return and close function
        if (this.function_wrap) {
            output = output.concat(this.gen_return(target.codegen_varname));
            output = output.concat("}\n");
        }

        return output;
    }

    analyze(root_element) {
        // Start recursive iteration over children
        let js_code = this.generate_js(root_element);
        return js_code;
    }

    // Generates code for el and recursively calls for all children
    generate_js(el) {
        let el_code = this.generate_node(el);
        el_code = el_code.concat("\n");

        for (const child of el.children) {
            let child_js = this.generate_js(child);
            el_code = el_code.concat(child_js);
        }
        return el_code;
    }

    // Returns JS code recreating el with its attributes
    generate_node(el) {
        // Generate name for node
        let s = "";
        let var_name = this.get_var_name(el);

        el.codegen_varname = var_name; // Save the name to the Node object

        let parent_var_name = get_parents_var_name(el);

        s = s.concat(this.gen_createelement(var_name, el.tagName));
        for (const attr of el.attributes) {
            s = s.concat(this.gen_setattribute(var_name, attr.name, attr.value));
        }

        // Add element to its parent, if not root
        if (parent_var_name !== null) {
            s = s.concat(this.gen_appendchild(var_name, parent_var_name));
        }
        return s;
    }

    gen_createelement(var_name, el_tag) {
        return this.format_line(`let ${var_name} = document.createElement("${el_tag}");\n`);
    }

    gen_setattribute(var_name, attr_name, attr_value) {
        // Attribute value can be JS, so should be stringified in generated code
        return this.format_line(`${var_name}.setAttribute("${attr_name}", "${attr_value}");\n`);
    }

    gen_appendchild(var_name, parent_var_name) {
        return this.format_line(`${parent_var_name}.appendChild(${var_name});\n`);
    }

    gen_return(var_name) {
        return this.format_line(`return ${var_name};\n`);
    }

    // Adds padding in front of the line, if opted in
    format_line(line) {
        // todo formatting options here
        return `${this.function_wrap ? "\t" : ""}${line}`;
    }

    get_var_name(el) {
        let el_tag = el.tagName;
        let times_used = this.used_counter[el_tag];
        if (times_used === undefined) {
            this.used_counter[el_tag] = 1;
            times_used = 0;
        } else {
            this.used_counter[el_tag] += 1;
        }

        return `${el_tag}_${times_used}`;
    }
}

// Returns variable name assigned to element
function get_parents_var_name(el) {
    if (el.parentElement) {
        return el.parentElement.codegen_varname;
    } else {
        return null;
    }
}