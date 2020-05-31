const css = require('css');
const layout = require('./layout');

const stack = [{
    element: 'document',
    children: []
}];

let currentToken = null;
let currentAttr = null;
let currentTextNode = null;

const EOF = Symbol("EOF");

let rules = [];
function addCSSRules(text) {
    let ast = css.parse(text);
    rules.push(...ast.stylesheet.rules)
}

function matchClass(classAttr, className) {
    let classes = [];
    classAttr.forEach(classAtt => {
        classes = classes.concat(classAtt.value.split(' '));
    });
    for (cl of classes) {
        if (cl === className) {
            return true;
        }
    }
    return false;
}

function match(element, selectorPart) {
    if (!element || !element.attrs)
        return false;

    if (selectorPart.charAt(0) === '#') {
        let att = element.attrs.filter(attr => attr.name === 'id');
        if (att.length > 0) {
            return att[0].value === selectorPart.replace('#', '');
        }
    } else if (selectorPart.charAt(0) === '.') {
        let classAttr = element.attrs.filter(attr => attr.name === 'class');
        if (classAttr.length > 0) {
            return matchClass(classAttr, selectorPart.replace('.', ''));
        }
    } else {
        return element.tagName === selectorPart;
    }
}

function computeCSS(element) {
    let elements = stack.slice().reverse();
    if (!element.computedStyle) {
        element.computedStyle = {};
    }
    for (let rule of rules) {
        let selectorParts = rule.selectors[0].split(' ').reverse();

        if (!match(element, selectorParts[0])) {
            continue;
        }
        let isMatch = false;
        if (selectorParts.length == 1) {
            isMatch = true;
        } else {
            let j = 1;
            for (let i = 0; i < elements.length; i++) {
                if (match(elements[i], selectorParts[j])) {
                    j++;
                }
                if (j >= selectorParts.length) {
                    isMatch = true;
                    break;
                }
            }
        }

        if (isMatch) {
            let p = specificity(rule.selectors[0]);
            for (let de of rule.declarations) {
                if (!element.computedStyle[de.property]) {
                    element.computedStyle[de.property] = {};
                }
                if (!element.computedStyle[de.property].specificity) {
                    element.computedStyle[de.property].specificity = p;
                    element.computedStyle[de.property].value = de.value;
                } else if (compareSp(element.computedStyle[de.property].specificity, p) < 0) {
                    for (let k = 0; k < p.length; k++)
                        element.computedStyle[de.property].specificity[k] += p[k];
                }
            }

        }
    }
}

function compareSp(sp1, sp2) {
    for (let i = 0; i < sp1.length; i++) {
        if (sp1[i] - sp2[i])
            return sp1[i] - sp2[i];
    }
    return 0;
}

function specificity(selector) {
    const p = [0, 0, 0, 0];
    let selectorParts = selector.split(" ");
    for (let part of selectorParts) {
        if (part.charAt(0) === '#') {
            p[1] += 1;
        } else if (part.charAt(0) === '.') {
            p[2] += 1;
        } else {
            p[3] += 1;
        }
    }
    return p;
}

function emitToken(token) {
    let top = stack[stack.length - 1];
    if (token.type === 'startTag') {
        let element = {
            tagName: '',
            children: [],
            attrs: [],
        };
        element.tagName = token.tagName;

        for (let p in token) {
            if (p != 'tagName' && p != 'type') {
                element.attrs.push({
                    name: p,
                    value: token[p],
                });
            }
        }

        computeCSS(element);

        top.children.push(element);
        // element.parent = top;

        if (!token.isSelfClosing) {
            stack.push(element);
        } else {
            layout(element);
        }
        currentTextNode = null;

    } else if (token.type === "endTag") {
        if (token.tagName !== top.tagName) {
            throw new Error("Tag start end doesn't match!");
        } else {
            if (token.tagName === 'style') {
                addCSSRules(top.children[top.children.length - 1].content);
            }
            stack.pop();
        }
        layout(top);
        currentTextNode = null;
    } else if (token.type === 'text') {
        if (!currentTextNode && token.content.match(/^[\t\n\f ]$/)) {
            return;
        }
        if (!currentTextNode) {
            currentTextNode = {
                type: 'text',
                content: '',
            }
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}

function data(c) {
    if (c == "<")
        return tagOpen;
    else if (c === EOF) {
        emitToken({
            type: 'EOF',
        })
        return;
    } else if (c === '\n') {
        return data;
    } else {
        emitToken({
            type: 'text',
            content: c,
        })
        return data;
    }
}

function tagOpen(c) {
    if (c === "/")
        return endTagOpen;
    else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'startTag',
            tagName: ''
        }
        return tagName(c);
    } else
        return;
}

function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: '',
        }
        return tagName(c);
    } else if (c === ">") {
        //emitToken(currentToken);
        return data;
    } else
        return;
}

function tagName(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c;
        return tagName;
    } else if (c === '>') {
        emitToken(currentToken);
        currentToken = null;
        return data;
    } else if (c === '/')
        return selfClosingStartTag;
    else if (c.match(/^[\t\n\f ]$/))
        return beforeAttrName;
    else
        return tagName;
}

function beforeAttrName(c) {
    if (c.match(/^[\t\n\f ]$/))
        return beforeAttrName;
    else if (c === '>') {
        currentToken[currentAttr.name] = currentAttr.value;
        emitToken(currentToken);
        currentToken = null;
        return data;
    }
    else if (c === "/")
        return selfClosingStartTag;
    else {
        currentAttr = {
            name: '',
            value: '',
        }
        return attrName(c);
    }
}

function attrName(c) {
    if (c === "=") {
        return beforeAttrValue;
    } else if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
        return afterAttrName(c);
    } else {
        currentAttr.name += c;
        return attrName;
    }
}

function beforeAttrValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttrValue;
    } else if (c === '"') {
        return doubleQuotedAttrValue;
    } else if (c === "'") {
        return singleQuotedAttrValue;
    } else {
        return unQuotedAttrValue(c);
    }
}

function doubleQuotedAttrValue(c) {
    if (c === '"') {
        currentToken[currentAttr.name] = currentAttr.value;
        return afterQuotedAttrValue;
    } else if (c === EOF) {

    } else {
        currentAttr.value += c;
        return doubleQuotedAttrValue;
    }
}

function singleQuotedAttrValue(c) {
    if (c === "'") {
        currentToken[currentAttr.name] = currentAttr.value;
        return afterQuotedAttrValue;
    } else if (c === EOF) {

    } else {
        currentAttr.value += c;
        return singleQuotedAttrValue;
    }
}

function unQuotedAttrValue(c) {
    if (c === '/') {
        currentToken[currentAttr.name] = currentAttr.value;
        return selfClosingStartTag;
    } else if (c === '>') {
        currentToken[currentAttr.name] = currentAttr.value;
        emitToken(currentToken);
        return data;
    } else if (c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttr.name] = currentAttr.value;
        return beforeAttrName;
    } else {
        currentAttr.value += c;
        return unQuotedAttrValue;
    }
}

function afterQuotedAttrValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttrName;
    } else if (c === '>') {
        currentToken[currentAttr.name] = currentAttr.value;
        emitToken(currentToken);
        return data;
    } else if (c === '/') {
        currentToken[currentAttr.name] = currentAttr.value;
        return selfClosingStartTag;
    }
}

function afterAttrName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return afterAttrName;
    } else if (c === '/') {
        return selfClosingStartTag;
    } else if (c === '>') {
        currentToken[currentAttr.name] = currentAttr.value;
        emitToken(currentToken);
        return data;
    } else {
        currentToken[currentAttr.name] = currentAttr.value;
        currentAttr = {
            name: '',
            value: ''
        }
        return attrName(c);
    }
}

function selfClosingStartTag(c) {
    if (c === ">") {
        currentToken.isSelfClosing = true;
        emitToken(currentToken);
        return data;
    } else if (c.match(/^[\t\n\f ]$/))
        return selfClosingStartTag;
    else
        return;
}

module.exports.parseHTML = function parseHTML(html) {
    let state = data;
    for (let c of html) {
        state = state(c);
    }
    state = state(EOF);
    return stack[0];
}
