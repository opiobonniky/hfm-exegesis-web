/**
 * Script to find React component props declared in interfaces/types
 * but missing from the function component parameter destructuring.
 *
 * Usage: node scripts/check-missing-props.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, '..', 'src');

const results = [];

function extractPropsFromInterfaceBlock(blockContent) {
  const props = [];
  const lines = blockContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Match property declarations: propName?: Type or propName: Type
    const propMatch = trimmed.match(/^\s*(\w+)\??\s*:/);
    if (propMatch && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
      props.push(propMatch[1]);
    }
  }
  return props;
}

function findInterfaceContent(content, interfaceName) {
  // Look for: (export)? interface Name { ... }
  const regex = new RegExp(`(?:export\\s+)?interface\\s+${interfaceName}\\s*(?:extends\\s+\\w+(?:\\s*,\\s*\\w+)*\\s*)?\\{`, 'g');
  const match = regex.exec(content);
  if (!match) return null;

  const start = match.index + match[0].length;
  let depth = 1;
  let i = start;
  while (i < content.length && depth > 0) {
    if (content[i] === '{') depth++;
    if (content[i] === '}') depth--;
    i++;
  }
  return content.substring(start, i - 1);
}

function findTypeContent(content, typeName) {
  // Look for: (export)? type Name = { ... }
  const regex = new RegExp(`(?:export\\s+)?type\\s+${typeName}\\s*=\\s*\\{`, 'g');
  const match = regex.exec(content);
  if (!match) return null;

  const start = match.index + match[0].length;
  let depth = 1;
  let i = start;
  while (i < content.length && depth > 0) {
    if (content[i] === '{') depth++;
    if (content[i] === '}') depth--;
    i++;
  }
  return content.substring(start, i - 1);
}

function findDestructuredProps(content) {
  const results = [];
  
  // Pattern 1: function Component({ prop1, prop2 }: InterfaceName)
  const funcPattern = /(?:function\s+\w+|export\s+default\s+function\s+\w+)\s*(?:<[^>]+>)?\s*\(\s*\{([^}]*)\}\s*:\s*(\w+(?:Props)?)/g;
  let match;
  while ((match = funcPattern.exec(content)) !== null) {
    const props = match[1].split(',')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => p.replace(/\s*=\s*[^,)}]*$/, '').trim()) // Strip default values
      .map(p => p.replace(/\s*:\s*\w+\s*$/, '').trim())
      .map(p => p.replace(/^\.\.\./, '').trim())
      .filter(p => /^\w/.test(p));
    results.push({ destructured: props, interfaceName: match[2] });
  }
  
  // Pattern 2: const Comp = ({ prop1, prop2 }: InterfaceName) =>
  const arrowPattern = /const\s+\w+\s*=\s*\(\s*\{([^}]*)\}\s*:\s*(\w+(?:Props)?)\s*\)\s*(?::\s*\w+(?:Props)?)?\s*=>/g;
  while ((match = arrowPattern.exec(content)) !== null) {
    const props = match[1].split(',')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => p.replace(/\s*=\s*[^,)}]*$/, '').trim()) // Strip default values
      .map(p => p.replace(/\s*:\s*\w+\s*$/, '').trim()) // Remove type annotations
      .map(p => p.replace(/^\.\.\./, '').trim())
      .filter(p => /^\w/.test(p));
    results.push({ destructured: props, interfaceName: match[2] });
  }
  
  return results;
}

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(SRC_DIR, filePath);
  
  // Find all interface/type names in the file
  const interfaceNames = new Set();
  const typeNames = new Set();
  
  let match;
  const ifaceRegex = /(?:export\s+)?interface\s+(\w+(?:Props)?)/g;
  while ((match = ifaceRegex.exec(content)) !== null) {
    interfaceNames.add(match[1]);
  }
  
  const typeRegex = /(?:export\s+)?type\s+(\w+(?:Props)?)\s*=\s*\{/g;
  while ((match = typeRegex.exec(content)) !== null) {
    typeNames.add(match[1]);
  }
  
  if (interfaceNames.size === 0 && typeNames.size === 0) return;
  
  // Find all destructuring patterns in this file
  const destructured = findDestructuredProps(content);
  
  for (const { destructured: destructuredProps, interfaceName } of destructured) {
    // Get the interface/type content
    let propsInInterface = null;
    
    if (interfaceNames.has(interfaceName)) {
      const block = findInterfaceContent(content, interfaceName);
      if (block) propsInInterface = extractPropsFromInterfaceBlock(block);
    } else if (typeNames.has(interfaceName)) {
      const block = findTypeContent(content, interfaceName);
      if (block) propsInInterface = extractPropsFromInterfaceBlock(block);
    }
    
    if (propsInInterface && propsInInterface.length > 0) {
      const missing = propsInInterface.filter(p => !destructuredProps.includes(p));
      if (missing.length > 0) {
        results.push({
          file: relativePath,
          interfaceName,
          propsInInterface,
          propsDestructured: destructuredProps,
          missingProps: missing,
        });
      }
    }
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      walkDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      try {
        auditFile(fullPath);
      } catch (err) {
        console.error(`Error processing ${fullPath}:`, err.message);
      }
    }
  }
}

console.log('Scanning for props declared in interfaces but missing from destructuring...\n');
walkDir(SRC_DIR);

if (results.length === 0) {
  console.log('No missing props found.');
} else {
  console.log(`Found ${results.length} component(s) with missing props:\n`);
  
  for (const result of results) {
    console.log(`  ${result.file}`);
    console.log(`    Interface: ${result.interfaceName}`);
    console.log(`    Props in interface: ${result.propsInInterface.join(', ')}`);
    console.log(`    Destructured:       ${result.propsDestructured.join(', ')}`);
    console.log(`    MISSING:            ${result.missingProps.join(', ')}`);
    console.log('');
  }
  
  console.log(`Total: ${results.length} component(s) with missing props`);
}
