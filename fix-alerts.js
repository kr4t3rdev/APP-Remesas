const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace Alert.alert({ title: "...", message: "..." }) with Alert.alert("...", "...")
  const regex = /Alert\.alert\(\s*\{\s*title:\s*(['"`][^'"`]+['"`]),\s*message:\s*(['"`][^'"`]+['"`])[\s\S]*?\}\s*\)/g;
  content = content.replace(regex, (match, title, message) => {
    changed = true;
    return `Alert.alert(${title}, ${message})`;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed alerts in ${filePath}`);
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
