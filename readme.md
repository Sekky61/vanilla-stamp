![image](https://github.com/Sekky61/vanilla-stamp/assets/24541288/2a88e971-7bf5-49bd-9ffc-1821c805c2d8)

# Vanilla-stamp

Generate JS function to create desired HTML element.

Deployed at: https://sekky61.github.io/vanilla-stamp/

## About

A simple tool hosted on a website is designed to help front-end developers with their coding tasks. The tool
        takes an input HTML and generates the corresponding JavaScript code that will generate the given HTML. This tool
        eliminates the need for manual coding and saves time and effort for the developers. The generated JavaScript
        code can be easily customized and optimized by the developer to meet the requirements of their project. The tool
        is easy and user-friendly.

## Example

Input:

```html
<h2 onclick="alert('bar');" w=king>The href Attribute</h2>
```

Output:

```javascript
function f() {
    let h2_0 = document.createElement("H2");
    h2_0.setAttribute("onclick", "alert(\'bar\');");
    h2_0.setAttribute("w", "king");
    h2_0.innerText = "The href Attribute";

    return h2_0;
}
```

## TODOs

* support templates using Babel/standalone (https://babeljs.io/docs/en/babel-standalone)
* https://dev.to/pulkitnagpal/transpile-jsx-using-your-own-custom-built-babel-plugin-4888
* Add option to use `<template>`
