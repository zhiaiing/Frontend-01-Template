var obj = {
    '>': {
        operation: 'children_1',
    },
    "#": {
        operation: 'id',
    },
    "[": {
        operation: 'attrStart',
    },
    "]": {
        operation: 'attrEnd',
    },
    '=': {
        operation: 'attrKey',
    },
    " ": {
        operation: 'children',
    },
    '*': {
        operation: 'end',
    },
    '.': {
        operation: 'class',
    }
}

var other = '';
var key = '';
var value = '';

function a (char, selectorObj) { 
if (obj[char]) {
    var status = obj[char].operation;
    
    if (status.indexOf('children') > -1) {
        selectorObj.children = {};
        if (status === 'children_1') {
            selectorObj.children.isFirst = true
        }
    }

    const lastStatus = selectorObj.currentStatus;


    if (selectorObj.currentStatus === 'id') {
        selectorObj.id = other;
    } else if (lastStatus === 'tagStart') {
        key = other;
    } else if (lastStatus === 'tagKey') {
        value = other;
        if (!selectorObj.attr) {
            selectorObj.attr = {};
        }
        selectorObj.attr[key] = value;
    } else if (lastStatus === 'attrEnd') {//不需要操作
    } else if (lastStatus === 'class') {
         if (other) {
             if (selectorObj[lastStatus]) {
                selectorObj[lastStatus] += ' ';
             } else {
                selectorObj[lastStatus] = ''
             }
             selectorObj[lastStatus] += other;
         }
    } else {
        if (other) {
            selectorObj['tag'] = other;
        }
    }
    other = '';

    selectorObj.currentStatus = status;
} else {
    other += char;
}

}

function match(selector, element) {
let selectorArray = selector.split(' ');
let selectorType= ['tag', 'id', 'class', 'attr']; // 
let isMatch = false;

var selectorObj = {};

var lastSelectorObj = selectorObj;

selector += '*';

for (let index = 0; index < selector.length; index++) {
    if (selectorObj.children) {
        selectorObj = selectorObj.children
    } 
        a(selector[index], selectorObj);
}

var elementObj = {
    tag: element.tagName.toLowerCase(),
    id: element.getAttribute('id'),
    class: element.getAttribute('class'),
    // attr: element.getAttribute('class') 
}

let isTrue = true;

return Object.keys(lastSelectorObj).some((key) => {
        if (key !== 'currentStatus') {
            if (key === 'attr') {
                  if (lastSelectorObj[obj].attr) {
                       Object.key(lastSelectorObj[obj].attr).some((key) => {
                           return element.getAttribute(key) !== lastSelectorObj[obj].attr[key];
                       })
                  }
            } else {
                let value = elementObj[key];
                if (value) {
                    if (key === 'class' && lastSelectorObj[key]) {
                        var classArray = value.split(' ');
                        var valArray = lastSelectorObj[key].split(' ');

                        return valArray.some((item) => {
                             return classArray.indexOf(item) === -1
                        })
                    }
                } else {
                    if (lastSelectorObj[key] !== value) {
                        return true;
                    }
                }
                
            }
        }

     
 })

}
//  match("#aaa", document.getElementById('aaa'))


// match("div #id.class", document.getElementById("id")); true

console.log(match("a#aa1.bb.cc", document.getElementById('aaa')))


// match("div #id.class", document.getElementById("id")); true