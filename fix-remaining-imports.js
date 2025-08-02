#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Additional import mappings for missed cases
const importMappings = [
  // Generic '../utils' imports that should go to shared/utils
  { from: /from ['"]\.\.\/utils['"]/g, to: "from '../shared/utils'" },
  { from: /from ['"]\.\.\/\.\.\/utils['"]/g, to: "from '../../shared/utils'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/utils['"]/g, to: "from '../../../shared/utils'" },
  
  // Generic '../types' imports that should go to shared/types  
  { from: /from ['"]\.\.\/types['"]/g, to: "from '../shared/types'" },
  { from: /from ['"]\.\.\/\.\.\/types['"]/g, to: "from '../../shared/types'" },
  
  // Generic '../constants' imports
  { from: /from ['"]\.\.\/constants['"]/g, to: "from '../shared/constants'" },
  { from: /from ['"]\.\.\/\.\.\/constants['"]/g, to: "from '../../shared/constants'" },
  
  // Fix any remaining lib/utils references in external files
  { from: /from ['"]@\/lib\/utils\/([^'"]+)['"]/g, to: "from '@/lib/shared/utils/$1'" },
  { from: /from ['"]@\/lib\/types\/([^'"]+)['"]/g, to: "from '@/lib/shared/types/$1'" },
  { from: /from ['"]@\/lib\/constants\/([^'"]+)['"]/g, to: "from '@/lib/shared/constants/$1'" },
  { from: /from ['"]@\/lib\/db\/([^'"]+)['"]/g, to: "from '@/lib/infrastructure/db/$1'" },
  { from: /from ['"]@\/lib\/supabase\/([^'"]+)['"]/g, to: "from '@/lib/infrastructure/supabase/$1'" },
  { from: /from ['"]@\/lib\/redis\/([^'"]+)['"]/g, to: "from '@/lib/infrastructure/redis/$1'" },
  { from: /from ['"]@\/lib\/tools\/([^'"]+)['"]/g, to: "from '@/lib/interfaces/tools/$1'" },
  { from: /from ['"]@\/lib\/actions\/([^'"]+)['"]/g, to: "from '@/lib/interfaces/actions/$1'" },
  { from: /from ['"]@\/lib\/agents\/([^'"]+)['"]/g, to: "from '@/lib/interfaces/agents/$1'" },
  
  // Fix full lib/utils/saju paths
  { from: /from ['"]@\/lib\/utils\/saju\/([^'"]+)['"]/g, to: "from '@/lib/core/saju/$1'" },
  { from: /from ['"]@\/lib\/utils\/saju['"]/g, to: "from '@/lib/core/saju/saju'" },
  { from: /from ['"]@\/lib\/utils\/harmony['"]/g, to: "from '@/lib/core/saju/harmony'" },
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
      console.log(`Fixed remaining imports in: ${filePath}`);
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

console.log('Fixing remaining import statements...');
dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Checking: ${dir}`);
    walkDirectory(dir);
  }
});

console.log('Fixed remaining imports!');