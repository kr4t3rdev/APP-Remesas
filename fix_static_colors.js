const fs = require('fs');

const filesToFix = [
  'src/screens/currencies/CurrenciesScreen.tsx',
  'src/screens/cash/CashHistoryScreen.tsx',
  'src/screens/transactions/TransactionsScreen.tsx',
  'src/screens/exchange-rates/ExchangeRatesScreen.tsx',
  'src/screens/bank-accounts/BankAccountsScreen.tsx',
  'src/screens/reports/ReportsScreen.tsx',
  'src/components/ui/Badge.tsx',
  'src/components/ui/Toast.tsx',
  'src/components/charts/Charts.tsx',
  'src/components/features/Dashboard/QuickActionCard.tsx',
  'src/components/features/Dashboard/BalanceCard.tsx',
  'src/components/features/Dashboard/TransactionSummaryCard.tsx',
];

filesToFix.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. Remove colors from static import
  if (content.match(/import \{.*?colors.*?\} from '.*theme';/)) {
    content = content.replace(/colors,\s*/g, '');
    content = content.replace(/,\s*colors/g, '');
    content = content.replace(/import\s*\{\s*colors\s*\}\s*from\s*'.*theme';\n?/g, '');
    
    // Add import { useColors }
    if (!content.includes('useColors')) {
      content = `import { useColors } from '${file.includes('components/features') ? '../../../store/themeStore' : (file.includes('components') ? '../../store/themeStore' : '../../store/themeStore')}';\n` + content;
    }
    changed = true;
  }

  // 2. Add const colors = useColors(); inside component
  const compMatch = content.match(/export const \w+: React\.FC.*?\> = \((.*?)\) => \{/);
  const compMatch2 = content.match(/export const \w+ = \((.*?)\) => \{/);
  const compMatch3 = content.match(/export function \w+\((.*?)\) \{/);
  
  let compStr = compMatch ? compMatch[0] : (compMatch2 ? compMatch2[0] : (compMatch3 ? compMatch3[0] : null));
  
  if (compStr && !content.includes('const colors = useColors()')) {
    content = content.replace(compStr, `${compStr}\n  const colors = useColors();`);
    changed = true;
  }

  // 3. Wrap StyleSheet.create
  if (content.includes('const styles = StyleSheet.create({')) {
    content = content.replace('const styles = StyleSheet.create({', 'const createStyles = (colors: any) => StyleSheet.create({');
    
    // Add const styles = createStyles(colors); inside component
    if (!content.includes('const styles = createStyles(colors);')) {
      content = content.replace('const colors = useColors();', 'const colors = useColors();\n  const styles = createStyles(colors);');
    }
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  }
});
