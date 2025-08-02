#!/usr/bin/env node
const fs = require('fs');

// Fix all interface exports in types file
const filePath = '/Users/tom/PRJ/ongleam/fortune_teller/lib/shared/types/saju.ts';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all remaining 'interface' with 'export interface'
  content = content.replace(/^interface /gm, 'export interface ');
  
  // Replace 'type TopThreeSinsals' with 'export type TopThreeSinsals'
  content = content.replace(/^type TopThreeSinsals/gm, 'export type TopThreeSinsals');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed all interface exports in saju types file');
  
} catch (error) {
  console.error('❌ Error fixing exports:', error.message);
}