#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Fix BirthInput object properties
const fieldMappings = [
  // birthType -> calendar
  { from: /birthType:/g, to: "calendar:" },
  
  // birthYear -> year
  { from: /birthYear:/g, to: "year:" },
  
  // birthMonth -> month
  { from: /birthMonth:/g, to: "month:" },
  
  // birthDay -> day
  { from: /birthDay:/g, to: "day:" },
  
  // birthTime -> hour
  { from: /birthTime:/g, to: "hour:" },
  
  // Access patterns
  { from: /\.birthType/g, to: ".calendar" },
  { from: /\.birthYear/g, to: ".year" },
  { from: /\.birthMonth/g, to: ".month" },
  { from: /\.birthDay/g, to: ".day" },
  { from: /\.birthTime/g, to: ".hour" },
  
  // String references
  { from: /"birthType"/g, to: '"calendar"' },
  { from: /"birthYear"/g, to: '"year"' },
  { from: /"birthMonth"/g, to: '"month"' },
  { from: /"birthDay"/g, to: '"day"' },
  { from: /"birthTime"/g, to: '"hour"' },
  
  // Input properties
  { from: /input\.birthType/g, to: "input.calendar" },
  { from: /input\.birthYear/g, to: "input.year" },
  { from: /input\.birthMonth/g, to: "input.month" },
  { from: /input\.birthDay/g, to: "input.day" },
  { from: /input\.birthTime/g, to: "input.hour" },
];

function updateBirthInputInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    fieldMappings.forEach(mapping => {
      const newContent = content.replace(mapping.from, mapping.to);
      if (newContent !== content) {
        content = newContent;
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed BirthInput fields in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      updateBirthInputInFile(fullPath);
    }
  });
}

// Update all directories
const dirs = [
  '/Users/tom/PRJ/ongleam/fortune_teller/lib',
  '/Users/tom/PRJ/ongleam/fortune_teller/app',
  '/Users/tom/PRJ/ongleam/fortune_teller/components',
  '/Users/tom/PRJ/ongleam/fortune_teller/config'
];

console.log('Fixing BirthInput field references...');
dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Checking: ${dir}`);
    walkDirectory(dir);
  }
});

console.log('Fixed BirthInput field references!');