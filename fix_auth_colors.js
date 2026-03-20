const fs = require('fs');
const path = require('path');

const dir = 'src/screens/auth';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if it doesn't have the static import (already fixed)
  if (!content.includes("import { useColors }")) {
     content = content.replace(/import \{.*?colors.*\} from '..\/..\/theme';/g, "import { spacing, borderRadius } from '../../theme';\nimport { useColors } from '../../store/themeStore';");
  }

  // Ensure createStyles is updated if it exists
  if (content.includes("StyleSheet.create({")) {
    if (!content.includes("const createStyles = (colors: any)")) {
       // Only if we need dynamic styles
       content = content.replace(/const styles = StyleSheet\.create\(\{/g, "const createStyles = (colors: any) => StyleSheet.create({");
    }
  }

  fs.writeFileSync(filePath, content);
}
console.log('Done');
