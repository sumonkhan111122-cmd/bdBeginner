const fs = require('fs');
const path = require('path');

// 1. Update wordpressThemes.ts
const wpPath = path.join(__dirname, '../src/data/wordpressThemes.ts');
let wpThemes = fs.readFileSync(wpPath, 'utf8');
wpThemes = wpThemes.replace(/"price":\s*99,/g, '"price": 0,');
fs.writeFileSync(wpPath, wpThemes, 'utf8');
console.log('Updated src/data/wordpressThemes.ts');

// 2. Update catalogProducts.ts
const catPath = path.join(__dirname, '../src/data/catalogProducts.ts');
let catProds = fs.readFileSync(catPath, 'utf8');
catProds = catProds.replace(/"price":\s*99,/g, '"price": 0,');
fs.writeFileSync(catPath, catProds, 'utf8');
console.log('Updated src/data/catalogProducts.ts');

// 3. Update products.ts Nova theme
const prodPath = path.join(__dirname, '../src/data/products.ts');
let prods = fs.readFileSync(prodPath, 'utf8');
prods = prods.replace(
  /id:\s*'p1',[\s\S]*?price:\s*1290,/,
  (match) => match.replace('price: 1290,', 'price: 0,')
);
fs.writeFileSync(prodPath, prods, 'utf8');
console.log('Updated Nova theme in src/data/products.ts');
