const fs = require('fs');

// I'll just use simple regex for the specific lines.
const patterns = [
  { search: /isDark \? ['"]#1e293b['"] : ['"]#fff['"]/g, replace: 'colors.card' },
  { search: /isDark \? ['"]#1e293b['"] : ['"]#ffffff['"]/g, replace: 'colors.card' },
  { search: /isDark \? ['"]#0f172a['"] : ['"]#f9fafb['"]/g, replace: 'colors.background' },
  { search: /isDark \? ['"]#f8fafc['"] : ['"]#111827['"]/g, replace: 'colors.text.primary' },
  { search: /isDark \? ['"]#94a3b8['"] : ['"]#6b7280['"]/g, replace: 'colors.text.secondary' },
  { search: /isDark \? ['"]#94a3b8['"] : ['"]#4b5563['"]/g, replace: 'colors.text.secondary' },
  { search: /isDark \? ['"]#9ca3af['"] : ['"]#9ca3af['"]/g, replace: 'colors.text.tertiary' },
  { search: /isDark \? ['"]#334155['"] : ['"]#f3f4f6['"]/g, replace: 'colors.surface' },
  { search: /isDark \? ['"]#334155['"] : ['"]#f1f5f9['"]/g, replace: 'colors.surface' },
  { search: /isDark \? ['"]#e2e8f0['"] : ['"]#374151['"]/g, replace: 'colors.text.primary' },
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = require('path').join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
      callback(dirPath);
    }
  });
}

walkDir('src/screens/admin', processFile);
walkDir('src/components/admin', processFile);

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const colorVar = content.includes('themeColors = useColors()') ? 'themeColors' : 'colors';

  patterns.forEach(p => {
    let replaceWith = p.replace.replace('colors', colorVar);
    if (p.search.test(content)) {
      content = content.replace(p.search, replaceWith);
      changed = true;
    }
  });

  if (changed) {
    if (!content.includes('useColors')) {
      content = `import { useColors } from '../../store/themeStore';\n` + content;
    }
    fs.writeFileSync(file, content);
  }
}
console.log('Done');
