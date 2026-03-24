const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Add import if needed
  if (content.includes('Alert.alert(') && content.includes('style: "cancel"')) {
    if (!content.includes('ConfirmModal')) {
      const importStatement = `import { ConfirmModal } from "../../components/ui/ConfirmModal";\n`;
      content = content.replace(/(import .* from ['"]react-native['"];)/, `$1\n${importStatement}`);
      
      // Need to add state
      const stateRegex = /const \[([^,]+ModalVisible),\s*set\1\]\s*=\s*useState\(false\);/;
      const match = content.match(stateRegex);
      if (match) {
        const stateStatement = `
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "primary" | "warning";
  }>({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });\n`;
        content = content.replace(match[0], `${match[0]}\n${stateStatement}`);
      }

      // Need to add component
      const componentStatement = `
      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>`;
      content = content.replace(/<\/SafeAreaView>/, componentStatement);
      
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated structure in ${filePath}`);
  }
}

const filesToUpdate = [
  'src/screens/currencies/CurrenciesScreen.tsx',
  'src/screens/worker-payments/WorkerPaymentsScreen.tsx',
  'src/screens/expenses/ExpensesScreen.tsx',
  'src/screens/expense-items/ExpenseItemsScreen.tsx',
  'src/screens/profile/ProfileScreen.tsx',
  'src/screens/bank-accounts/BankAccountsScreen.tsx'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
  }
});
