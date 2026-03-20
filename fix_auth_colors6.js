const fs = require('fs');
const path = require('path');

const dir = 'src/screens/auth';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Change the function parameter to themeColors
  content = content.replace(/const createStyles = \(colors: any\) =>/g, 'const createStyles = (themeColors: any) =>');
  
  // If LoginScreen has inline styles without createStyles, fix them:
  // e.g. `<SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>`
  // That's actually correct if themeColors is defined in the component. 
  // Let's check why LoginScreen has an error at line 42. It might not have `const themeColors = useColors()` inside!
  
  fs.writeFileSync(filePath, content);
}
console.log('Done');
