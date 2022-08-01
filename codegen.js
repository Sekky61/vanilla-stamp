// JS generating class
export class CodeGen {
    constructor() {
        this.used_counter = {};

        // todo load options such as:
        // generate code inside a fuction
    }

    reset_context() {
        this.used_counter = {};
    }

    // Param html_string: string, HTML snippet
    // Returns code
    // If html_string is not well-formed, returns false
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
            console.error("No children parsing error");
            return "";
        }

        let target = template_content.firstElementChild; // The root node of input html

        if (!target) {
            console.error("Parsing error");
            return "";
        }

        let code = this.analyze(target);
        return code;
    }

    analyze(root_element) {
        // Start recursive iteration over children
        let js_code = this.generate_js(root_element);
        return js_code;
    }

    generate_js(el) {
        let el_code = this.generate_node(el);
        for (const child of el.children) {
            let child_js = this.generate_js(child);
            el_code = el_code.concat(child_js);
        }
        return el_code;
    }

    generate_node(el) {
        // Generate name for node
        let s = "";
        let var_name = this.get_var_name(el);
        get_parents_var_name(el);

        // Save the name to the Node object
        el.codegen_varname = var_name;

        s = s.concat(`let ${var_name} = document.createElement("${el.tagName}")\n`);
        for (const attr of el.attributes) {
            s = s.concat(`Attr ${attr.name} - ${attr.value}\n`);
        }
        return s;
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