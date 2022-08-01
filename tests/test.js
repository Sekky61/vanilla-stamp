import { CodeGen } from '../codegen.js';

// Testing framework

function it(desc, fn) {
    try {
        fn();
        console.log('\x1b[32m%s\x1b[0m', '\u2714 ' + desc);
    } catch (error) {
        console.log('\n');
        console.log('\x1b[31m%s\x1b[0m', '\u2718 ' + desc);
        console.error(error);
    }
}

function assert(condition) {
    if (!condition) {
        throw new Error();
    }
}

// Actual tests

it('should reject non-HTML', function () {
    let gen = new CodeGen();
    let code = gen.generate(`cheese`);
    assert(code === null);
});
