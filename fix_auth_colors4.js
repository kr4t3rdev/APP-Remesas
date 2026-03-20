const fs = require('fs');
const path = require('path');

const dir = 'src/screens/auth';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  if (file === 'WelcomeScreen.tsx') continue;

  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Insert const styles = createStyles(themeColors); after const themeColors = useColors();
  if (!content.includes("const styles = createStyles(themeColors);")) {
    content = content.replace(/const themeColors = useColors\(\);/, "const themeColors = useColors();\n  const styles = createStyles(themeColors);");
  }

  // If there's an issue with duplicate const styles = createStyles, we should be careful.
  fs.writeFileSync(filePath, content);
}
console.log('Done');
