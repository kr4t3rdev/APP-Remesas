const fs = require('fs');
const path = require('path');

const dir = 'src/screens/auth';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes("import { useColors }")) {
    content = content.replace(/import \{ spacing.*?\} from '..\/..\/theme';/, "import { spacing, borderRadius } from '../../theme';\nimport { useColors } from '../../store/themeStore';");
  }

  // Same for LoginScreen which might just import { spacing }
  if (!content.includes("import { useColors }") && content.includes("import { spacing")) {
     content = content.replace(/import \{ spacing.*?\} from '..\/..\/theme';/, "import { spacing, borderRadius } from '../../theme';\nimport { useColors } from '../../store/themeStore';");
  }

  // For ChangePasswordScreen it says "theme.textSecondary" in some place?
  content = content.replace(/color=\{theme\.textSecondary\}/g, "color={themeColors.text.secondary}");

  fs.writeFileSync(filePath, content);
}
console.log('Done');
