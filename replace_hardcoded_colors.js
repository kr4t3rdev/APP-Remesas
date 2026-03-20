const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{tsx,ts}');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Determine the variable name for theme colors
  let colorVar = 'colors';
  if (content.includes('themeColors = useColors()')) {
    colorVar = 'themeColors';
  } else if (content.includes('const theme = useThemeStore')) {
    colorVar = 'theme.currentColors';
  }

  // Helper to replace with regex
  const replace = (regex, replacement) => {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      changed = true;
    }
  };

  // Replace text colors
  replace(/color:\s*['"](#fff|#FFF|#ffffff|#FFFFFF|white)['"]/g, `color: ${colorVar}.text.inverse`);
  replace(/color=\{?['"](#fff|#FFF|#ffffff|#FFFFFF|white)['"]\}?/g, `color={${colorVar}.text.inverse}`);

  // Replace background colors. Be careful with 'white' in strings, so regex must match specific patterns.
  replace(/backgroundColor:\s*['"](#fff|#FFF|#ffffff|#FFFFFF|white)['"]/g, `backgroundColor: ${colorVar}.card`);
  
  // Replace border colors
  replace(/borderColor:\s*['"](#fff|#FFF|#ffffff|#FFFFFF|white)['"]/g, `borderColor: ${colorVar}.border`); // wait, sometimes border is card
  replace(/borderColor:\s*isDark \? ['"]#[0-9a-fA-F]+['"] : ['"]#fff['"]/g, `borderColor: ${colorVar}.card`);
  
  // Replace ternary isDark ? darkColor : lightColor
  replace(/backgroundColor:\s*isDark \? ['"]#[0-9a-fA-F]+['"] : ['"]#fff['"]/g, `backgroundColor: ${colorVar}.card`);
  replace(/backgroundColor:\s*isDark \? ['"]#[0-9a-fA-F]+['"] : ['"]#ffffff['"]/g, `backgroundColor: ${colorVar}.card`);
  replace(/borderColor:\s*isDark \? ['"]#[0-9a-fA-F]+['"] : ['"]#ffffff['"]/g, `borderColor: ${colorVar}.card`);

  if (changed) {
    // Make sure we have useColors imported if we are using it
    if (!content.includes('useColors')) {
      if (content.includes("import { colors } from")) {
        content = content.replace(/import \{.*?colors.*?\} from ['"](.*?)theme['"]/, "import { useColors } from '$1store/themeStore';\nimport { colors } from '$1theme'");
      } else {
        // Just a fallback
      }
    }
    fs.writeFileSync(file, content);
  }
});
console.log('Done');
