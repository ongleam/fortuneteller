#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Define the mapping of old imports to new imports
const importMappings = [
  // Types imports
  { from: /from ['"]\.\.\/\.\.\/types\/([^'"]+)['"]/g, to: "from '../../shared/types/$1'" },
  { from: /from ['"]\.\.\/types\/([^'"]+)['"]/g, to: "from '../shared/types/$1'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/lib\/types\/([^'"]+)['"]/g, to: "from '../../shared/types/$1'" },
  
  // DB imports
  { from: /from ['"]\.\.\/\.\.\/db\/([^'"]+)['"]/g, to: "from '../../infrastructure/db/$1'" },
  { from: /from ['"]\.\.\/db\/([^'"]+)['"]/g, to: "from '../infrastructure/db/$1'" },
  
  // Supabase imports
  { from: /from ['"]\.\.\/\.\.\/supabase\/([^'"]+)['"]/g, to: "from '../../infrastructure/supabase/$1'" },
  { from: /from ['"]\.\.\/supabase\/([^'"]+)['"]/g, to: "from '../infrastructure/supabase/$1'" },
  
  // Redis imports
  { from: /from ['"]\.\.\/\.\.\/redis\/([^'"]+)['"]/g, to: "from '../../infrastructure/redis/$1'" },
  { from: /from ['"]\.\.\/redis\/([^'"]+)['"]/g, to: "from '../infrastructure/redis/$1'" },
  
  // Utils imports (now shared/utils)
  { from: /from ['"]\.\.\/\.\.\/utils\/([^'"]+)['"]/g, to: "from '../../shared/utils/$1'" },
  { from: /from ['"]\.\.\/utils\/([^'"]+)['"]/g, to: "from '../shared/utils/$1'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/lib\/utils\/([^'"]+)['"]/g, to: "from '../../shared/utils/$1'" },
  
  // Constants imports
  { from: /from ['"]\.\.\/\.\.\/constants\/([^'"]+)['"]/g, to: "from '../../shared/constants/$1'" },
  { from: /from ['"]\.\.\/constants\/([^'"]+)['"]/g, to: "from '../shared/constants/$1'" },
  
  // Tools imports (now interfaces/tools)
  { from: /from ['"]\.\.\/\.\.\/tools\/([^'"]+)['"]/g, to: "from '../../interfaces/tools/$1'" },
  { from: /from ['"]\.\.\/tools\/([^'"]+)['"]/g, to: "from '../interfaces/tools/$1'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/lib\/tools\/([^'"]+)['"]/g, to: "from '../../interfaces/tools/$1'" },
  
  // Actions imports (now interfaces/actions)
  { from: /from ['"]\.\.\/\.\.\/actions\/([^'"]+)['"]/g, to: "from '../../interfaces/actions/$1'" },
  { from: /from ['"]\.\.\/actions\/([^'"]+)['"]/g, to: "from '../interfaces/actions/$1'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/lib\/actions\/([^'"]+)['"]/g, to: "from '../../interfaces/actions/$1'" },
  
  // Agents imports (now interfaces/agents)
  { from: /from ['"]\.\.\/\.\.\/agents\/([^'"]+)['"]/g, to: "from '../../interfaces/agents/$1'" },
  { from: /from ['"]\.\.\/agents\/([^'"]+)['"]/g, to: "from '../interfaces/agents/$1'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/lib\/agents\/([^'"]+)['"]/g, to: "from '../../interfaces/agents/$1'" },

  // Saju utils imports (now core/saju)
  { from: /from ['"]\.\.\/\.\.\/utils\/saju\/([^'"]+)['"]/g, to: "from '../../core/saju/$1'" },
  { from: /from ['"]\.\.\/utils\/saju\/([^'"]+)['"]/g, to: "from '../core/saju/$1'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/lib\/utils\/saju\/([^'"]+)['"]/g, to: "from '../../core/saju/$1'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/lib\/utils\/saju\/([^'"]+)['"]/g, to: "from '../../../core/saju/$1'" },
  
  // Direct saju.ts file imports (now in core/saju)
  { from: /from ['"]\.\.\/\.\.\/utils\/saju['"]/g, to: "from '../../core/saju/saju'" },
  { from: /from ['"]\.\.\/utils\/saju['"]/g, to: "from '../core/saju/saju'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/lib\/utils\/saju['"]/g, to: "from '../../core/saju/saju'" },
  
  // Harmony imports (now in core/saju)  
  { from: /from ['"]\.\.\/\.\.\/utils\/harmony['"]/g, to: "from '../../core/saju/harmony'" },
  { from: /from ['"]\.\.\/utils\/harmony['"]/g, to: "from '../core/saju/harmony'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/lib\/utils\/harmony['"]/g, to: "from '../../core/saju/harmony'" },
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
      console.log(`Updated imports in: ${filePath}`);
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

// Update imports in the new lib structure
const libDir = '/Users/tom/PRJ/ongleam/fortune_teller/lib';
console.log('Updating import statements in the new lib structure...');
walkDirectory(libDir);

// Also update any files that import from lib
const rootDirs = [
  '/Users/tom/PRJ/ongleam/fortune_teller/app',
  '/Users/tom/PRJ/ongleam/fortune_teller/components', 
  '/Users/tom/PRJ/ongleam/fortune_teller/config'
];

rootDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Updating imports in: ${dir}`);
    walkDirectory(dir);
  }
});

console.log('Import update completed!');