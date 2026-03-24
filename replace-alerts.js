const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('Alert.alert')) return;

  let changed = false;

  // Find import { ... Alert ... } from 'react-native'
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]react-native['"]/;
  const match = content.match(importRegex);

  if (match) {
    const importedItems = match[1].split(',').map(s => s.trim());
    if (importedItems.includes('Alert')) {
      // Remove Alert from the react-native import
      const newItems = importedItems.filter(item => item !== 'Alert');
      
      if (newItems.length === 0) {
        content = content.replace(match[0], '');
      } else {
        content = content.replace(match[1], ` ${newItems.join(', ')} `);
      }
      
      // Calculate relative path to src/utils/alert
      const fileDir = path.dirname(filePath);
      const utilsDir = path.resolve(__dirname, 'src/utils');
      let relativePath = path.relative(fileDir, utilsDir) + '/alert';
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }
      
      // Add new import after react-native import
      const newImport = `import { Alert } from '${relativePath}';\n`;
      content = content.replace(/(import\s+.*from\s+['"]react-native['"];?)/, `$1\n${newImport}`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      processFile(filePath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
