
// TODO is exporting this needed to catch it?
class CodeGenError extends Error {
    constructor(message) {
        super(message); // (1)
        this.name = "CodeGenError"; // (2)
    }
}

// JS generating class
export class CodeGen {

    // Constructor
    // Invalid values will be rejected by throwing CodeGenError.
    //
    // Options:
    // Name             | Type      | Default   | Description
    // function_wrap    | bool      | true      | if true, generated code will be inside a function
    // indent_type      | string    | "tabs"    | "tabs" or "spaces". Option "spaces" requires field space_count
    // space_count      | number    | 4         | number (>0) of spaces used in spac indentation
    constructor(user_options) {
        // Used for generating variable names
        this.used_counter = {};

        // Defaults
        let options = {
            function_wrap: true,
            indent_type: "tabs",
            space_count: 4
        };
        Object.assign(options, user_options);

        console.dir(options);

        let val = options.function_wrap;
        if (typeof val === "boolean") {
            this.function_wrap = val;
        } else {
            throw new CodeGenError(`Invalid argument function_wrap: ${options.function_wrap}`);
        }

        // Indentation
        if (options.indent_type === "tabs") {
            this.indent_type = "tabs";
            this.indent_str = "\t";
        } else if (options.indent_type === "spaces") {
            this.indent_type = "spaces";
            if (options.space_count && typeof options.space_count === "number" && options.space_count > 0) {
                this.space_count = options.space_count;
                this.indent_str = " ".repeat(this.space_count);
            } else {
                throw new CodeGenError(`Invalid argument space_count: ${options.space_count}`);
            }
        } else {
            throw new CodeGenError(`Invalid argument indent_type: ${options.indent_type}`);
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
            console.error("Parsing error");
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

        if (el.innerText !== "") {
            s = s.concat(this.gen_innertext(var_name, el.innerText));
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
        return this.format_line(`${var_name}.setAttribute("${escape_string(attr_name)}", "${escape_string(attr_value)}");\n`);
    }

    // todo study http://perfectionkills.com/the-poor-misunderstood-innerText/
    // todo check document.createTextNode(str);
    gen_innertext(var_name, text) {
        return this.format_line(`${var_name}.innerText = "${escape_string(text)}";\n`);
    }

    gen_appendchild(var_name, parent_var_name) {
        return this.format_line(`${parent_var_name}.appendChild(${var_name});\n`);
    }

    gen_return(var_name) {
        return this.format_line(`return ${var_name};\n`);
    }

    // Adds padding in front of the line, if opted in
    format_line(line) {
        return `${this.function_wrap ? this.indent_str : ""}${line}`;
    }

    // Generates name for variable pointing to HTML node
    // ex: var pointing to <p> will be named p_0
    get_var_name(el) {
        let el_tag = el.nodeName.toLowerCase(); // nodeName is capitalized
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

// Add slashes before characters ', " and \
// Source: https://stackoverflow.com/questions/770523/escaping-strings-in-javascript
function escape_string(str) {
    return str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
} 
