const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
      if (!dirPath.includes('__tests__') && !dirPath.includes('.test.') && !dirPath.includes('screens/auth')) {
        callback(dirPath);
      }
    }
  });
}

walkDir('src', file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const replace = (regex, replacement) => {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      changed = true;
    }
  };

  // Replace text colors
  replace(/color:\s*['"](#fff|#FFF|#ffffff|#FFFFFF|white)['"]/g, `color: themeColors.text.inverse`);
  replace(/color=\{?['"](#fff|#FFF|#ffffff|#FFFFFF|white)['"]\}?/g, `color={themeColors.text.inverse}`);

  replace(/backgroundColor:\s*['"](#fff|#FFF|#ffffff|#FFFFFF|white)['"]/g, `backgroundColor: themeColors.card`);
  
  replace(/borderColor:\s*['"](#fff|#FFF|#ffffff|#FFFFFF|white)['"]/g, `borderColor: themeColors.border`);
  replace(/borderColor:\s*isDark \? ['"]#[0-9a-fA-F]+['"] : ['"]#fff['"]/g, `borderColor: themeColors.card`);
  
  replace(/backgroundColor:\s*isDark \? ['"]#[0-9a-fA-F]+['"] : ['"]#fff['"]/g, `backgroundColor: themeColors.card`);
  replace(/backgroundColor:\s*isDark \? ['"]#[0-9a-fA-F]+['"] : ['"]#ffffff['"]/g, `backgroundColor: themeColors.card`);
  replace(/borderColor:\s*isDark \? ['"]#[0-9a-fA-F]+['"] : ['"]#ffffff['"]/g, `borderColor: themeColors.card`);

  if (changed) {
    // Make sure themeColors exists in the component
    if (!content.includes('const themeColors = useColors()')) {
      // Find component definition
      const compMatch = content.match(/export const \w+: React\.FC.*?\> = \((.*?)\) => \{/);
      if (compMatch) {
         content = content.replace(compMatch[0], `${compMatch[0]}\n  const themeColors = useColors();`);
      } else {
         const compMatch2 = content.match(/export const \w+ = \((.*?)\) => \{/);
         if (compMatch2) {
           content = content.replace(compMatch2[0], `${compMatch2[0]}\n  const themeColors = useColors();`);
         }
      }
    }

    // Change styles to createStyles
    if (content.includes('const styles = StyleSheet.create({')) {
      content = content.replace('const styles = StyleSheet.create({', 'const createStyles = (themeColors: any) => StyleSheet.create({');
      
      // Inject styles call inside component
      if (!content.includes('const styles = createStyles(themeColors)')) {
         content = content.replace('const themeColors = useColors();', 'const themeColors = useColors();\n  const styles = createStyles(themeColors);');
      }
    }

    // Imports
    if (!content.includes('useColors')) {
      if (content.includes("import { colors } from")) {
        content = content.replace(/import \{.*?colors.*?\} from ['"](.*?)theme['"]/, "import { useColors } from '$1store/themeStore';\nimport { colors } from '$1theme'");
      } else {
        content = `import { useColors } from '../../store/themeStore';\n` + content;
      }
    }
    fs.writeFileSync(file, content);
  }
});
console.log('Done');
