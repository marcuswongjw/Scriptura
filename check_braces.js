const fs = require('fs');
const code = fs.readFileSync('modules.js', 'utf8');

let braceCount = 0;
let parenCount = 0;
let bracketCount = 0;

let inString = false;
let stringChar = '';
let inComment = false;
let commentType = ''; // 'single' or 'multi'

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

  // Check comment start
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

  // Check string start
  if (char === '"' || char === "'" || char === '`') {
    inString = true;
    stringChar = char;
    continue;
  }

  if (char === '{') braceCount++;
  if (char === '}') braceCount--;
  if (char === '(') parenCount++;
  if (char === ')') parenCount--;
  if (char === '[') bracketCount++;
  if (char === ']') bracketCount--;

  if (braceCount < 0) {
    console.log(`Extra closing brace '}' at position ${i}, line ${code.substring(0, i).split('\n').length}`);
    braceCount = 0;
  }
}

console.log(`Final count: Braces = ${braceCount}, Parens = ${parenCount}, Brackets = ${bracketCount}`);
