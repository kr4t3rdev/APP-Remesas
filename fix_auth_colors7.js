const fs = require('fs');
const path = require('path');

const dir = 'src/screens/auth';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix syntax: function createStyles(themeColors: any) => StyleSheet.create({ ... })
  // To: const createStyles = (themeColors: any) => StyleSheet.create({ ... })
  content = content.replace(/function createStyles\(themeColors: any\) => StyleSheet\.create\(\{/g, 'const createStyles = (themeColors: any) => StyleSheet.create({');

  fs.writeFileSync(filePath, content);
}
console.log('Done');
