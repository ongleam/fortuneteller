#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Fix saju and harmony specific imports
const importMappings = [
  // Fix saju imports that went to shared/utils instead of core/saju
  { from: /from ['"]@\/lib\/shared\/utils\/saju['"]/g, to: "from '@/lib/core/saju/saju'" },
  { from: /from ['"]@\/lib\/shared\/utils\/harmony['"]/g, to: "from '@/lib/core/saju/harmony'" },
  
  // Fix any other incorrect saju paths
  { from: /from ['"]\.\.\/shared\/utils\/saju['"]/g, to: "from '../core/saju/saju'" },
  { from: /from ['"]\.\.\/shared\/utils\/harmony['"]/g, to: "from '../core/saju/harmony'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/utils\/saju['"]/g, to: "from '../../core/saju/saju'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/utils\/harmony['"]/g, to: "from '../../core/saju/harmony'" },
];

function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    importMappings.forEach(mapping => {
      const newContent = content.replace(mapping.from, mapping.to);
      if (newContent !== content) {
        content = newContent;
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed saju imports in: ${filePath}`);
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
      updateImportsInFile(fullPath);
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

console.log('Fixing saju and harmony import statements...');
dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Checking: ${dir}`);
    walkDirectory(dir);
  }
});

console.log('Fixed saju and harmony imports!');