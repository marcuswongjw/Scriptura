const fs = require('fs');
const code = fs.readFileSync('modules.js', 'utf8');

let stack = [];
let inString = false;
let stringChar = '';
let inComment = false;
let commentType = '';

for (let i = 0; i < code.length; i++) {
  const char = code[i];
  const nextChar = code[i+1];

  if (inComment) {
    if (commentType === 'single' && (char === '\n' || char === '\r')) {
      inComment = false;
    } else if (commentType === 'multi' && char === '*' && nextChar === '/') {
      inComment = false;
      i++;
    }
    continue;
  }

  if (inString) {
    if (char === stringChar && code[i-1] !== '\\') {
      inString = false;
    }
    continue;
  }

  if (char === '/' && nextChar === '/') {
    inComment = true;
    commentType = 'single';
    i++;
    continue;
  }
  if (char === '/' && nextChar === '*') {
    inComment = true;
    commentType = 'multi';
    i++;
    continue;
  }

  if (char === '"' || char === "'" || char === '`') {
    inString = true;
    stringChar = char;
    continue;
  }

  if (char === '{') {
    stack.push({ pos: i, line: code.substring(0, i).split('\n').length });
  }
  if (char === '}') {
    stack.pop();
  }
}

console.log('Unclosed braces at line(s):');
stack.forEach(item => console.log(`Line ${item.line}`));
