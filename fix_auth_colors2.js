const fs = require('fs');
const path = require('path');

const dir = 'src/screens/auth';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  if (file === 'WelcomeScreen.tsx') continue; // Already manually fixed

  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace static colors import with useColors
  if (!content.includes("useColors")) {
    content = content.replace(/import \{.*?colors.*\} from '..\/..\/theme';/, "import { spacing, borderRadius } from '../../theme';\nimport { useColors } from '../../store/themeStore';");
  }

  // Inside the component, ensure const themeColors = useColors() exists
  // Find the component declaration
  const componentRegex = /export const \w+: React\.FC.*?\> = \((.*?)\) => \{/;
  const match = content.match(componentRegex);
  
  if (match) {
    if (!content.includes("const themeColors = useColors()")) {
      content = content.replace(componentRegex, `${match[0]}\n  const themeColors = useColors();`);
    }
  }

  // If there's a createStyles or styles
  if (content.includes("const styles = StyleSheet.create({")) {
    content = content.replace(/const styles = StyleSheet\.create\(\{/, "const createStyles = (themeColors: any) => StyleSheet.create({");
    if (!content.includes("const styles = createStyles")) {
      content = content.replace(/const themeColors = useColors\(\);/, "const themeColors = useColors();\n  const styles = createStyles(themeColors);");
    }
  }

  // Replace colors. with themeColors. everywhere except in createStyles definition
  // We'll just replace colors. with themeColors. globally
  content = content.replace(/colors\./g, 'themeColors.');
  
  // Replace useColors() -> useColors() to avoid themeColors. useColors() issue
  content = content.replace(/useColors\(\)/g, 'useColors()'); // No change needed if we do it carefully

  // Wait, if I replaced colors. with themeColors., then `useColors()` is fine. 
  // What about `colors={[themeColors.primary...`? That's fine.
  // What about hardcoded '#fff' or '#FFFFFF'?
  content = content.replace(/'#fff'/g, 'themeColors.text.inverse');
  content = content.replace(/'#FFFFFF'/g, 'themeColors.text.inverse');
  content = content.replace(/"#FFFFFF"/g, 'themeColors.text.inverse');

  fs.writeFileSync(filePath, content);
}
console.log('Done');
