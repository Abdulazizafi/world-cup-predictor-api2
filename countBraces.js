const fs = require('fs');

const content = fs.readFileSync('src/components/match/MatchCard.tsx', 'utf8');

let curlyCount = 0;
let parenCount = 0;
let bracketCount = 0;

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  if (char === '{') curlyCount++;
  else if (char === '}') curlyCount--;
  else if (char === '(') parenCount++;
  else if (char === ')') parenCount--;
  else if (char === '[') bracketCount++;
  else if (char === ']') bracketCount--;
}

console.log('Curly imbalance:', curlyCount);
console.log('Paren imbalance:', parenCount);
console.log('Bracket imbalance:', bracketCount);
