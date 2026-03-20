const fs = require('fs');
const path = require('path');

const dir = 'src/screens/auth';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  if (file === 'WelcomeScreen.tsx') continue;

  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix invalid JSX: color=themeColors.text.inverse -> color={themeColors.text.inverse}
  content = content.replace(/color=themeColors\.text\.inverse/g, 'color={themeColors.text.inverse}');
  
  // Wait, did I also replace backgroundColor="#FFFFFF" etc?
  content = content.replace(/backgroundColor=themeColors\.text\.inverse/g, 'backgroundColor={themeColors.text.inverse}');
  content = content.replace(/borderColor=themeColors\.text\.inverse/g, 'borderColor={themeColors.text.inverse}');

  fs.writeFileSync(filePath, content);
}
console.log('Done');
