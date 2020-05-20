function getNextArray(ruleArray) {
    const next = [];
    let length = 0;
    ruleArray.map((item, index) => {
        if (index === 0) {
            next.push(-1); 
        } else {
            if (ruleArray[length] === item) {
                next.push(length); 
                length++;
            } else {
                next.push(length);
                length = 0; 
            }
        }
    })
    return next;
}

function getExistString(ruleString, targetString) {
    const ruleArray = ruleString.split('');  
    const targetArray = targetString.split('');  
    
    let ruleLength = 0;
    const next = getNextArray(ruleArray);
    
    for (let index = 0; index < targetArray.length; index++) {
        const char = targetArray[index];
        
        if (char === ruleArray[ruleLength]) {
            ruleLength++;
            if (ruleLength === ruleArray.length) {
                return true;
            }
        } else {
            if (ruleLength !== 0) {
                let needContinue = true;
                while(needContinue) {
                    ruleLength = next[ruleLength];
                    if (ruleLength === -1) {
                        ruleLength = 0;
                    }
                    if (char === ruleArray[ruleLength]) {
                        needContinue = false;
                        ruleLength++;
                    }
                    if (ruleLength === 0) {
                        needContinue = false;
                    }
                }
            }
        }
    }

    return false;
}
console.log(getExistString('abababab', 'abababaabababab'));//true

console.log(getExistString('aaaaaa', 'aaaaabaaaaaa'));//true

console.log(getExistString('abcabcabc', 'abcabcababcababcabcabc'));//true

console.log(getExistString('aaaaaa', 'aaaaabaaaaa'));//false