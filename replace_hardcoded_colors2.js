const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
      callback(dirPath);
    }
  });
}

walkDir('src', file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  let colorVar = 'colors';
  if (content.includes('themeColors = useColors()') || content.includes('themeColors.text')) {
    colorVar = 'themeColors';
  }

  const replace = (regex, replacement) => {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      changed = true;
    }
  };

  replace(/color:\s*['"](#fff|#FFF|#ffffff|#FFFFFF|white)['"]/g, `color: ${colorVar}.text.inverse`);
  replace(/color=\{?['"](#fff|#FFF|#ffffff|#FFFFFF|white)['"]\}?/g, `color={${colorVar}.text.inverse}`);

  replace(/backgroundColor:\s*['"](#fff|#FFF|#ffffff|#FFFFFF|white)['"]/g, `backgroundColor: ${colorVar}.card`);
  
  replace(/borderColor:\s*['"](#fff|#FFF|#ffffff|#FFFFFF|white)['"]/g, `borderColor: ${colorVar}.border`);
  replace(/borderColor:\s*isDark \? ['"]#[0-9a-fA-F]+['"] : ['"]#fff['"]/g, `borderColor: ${colorVar}.card`);
  
  replace(/backgroundColor:\s*isDark \? ['"]#[0-9a-fA-F]+['"] : ['"]#fff['"]/g, `backgroundColor: ${colorVar}.card`);
  replace(/backgroundColor:\s*isDark \? ['"]#[0-9a-fA-F]+['"] : ['"]#ffffff['"]/g, `backgroundColor: ${colorVar}.card`);
  replace(/borderColor:\s*isDark \? ['"]#[0-9a-fA-F]+['"] : ['"]#ffffff['"]/g, `borderColor: ${colorVar}.card`);

  if (changed) {
    if (!content.includes('useColors')) {
      if (content.includes("import { colors } from")) {
        content = content.replace(/import \{.*?colors.*?\} from ['"](.*?)theme['"]/, "import { useColors } from '$1store/themeStore';\nimport { colors } from '$1theme'");
      } else if (content.includes("import { spacing")) {
         // rough fallback
      }
    }
    fs.writeFileSync(file, content);
  }
});
console.log('Done');
