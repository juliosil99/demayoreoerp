
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const csvService = {
  exportTemplate: () => {
    const headers = ['Code', 'Name', 'Type', 'Level', 'SAT Code', 'Account Use'];
    const csvContent = headers.join(',') + '\n';
    const exampleRow = ['1000', 'Example Account', 'Assets', '1', 'SAT123', 'G01'].join(',');
    const template = csvContent + exampleRow;

    downloadCsv(template, 'chart_of_accounts_template.csv');
    toast.success('Template downloaded successfully');
  },

  exportAccounts: (accounts: any[]) => {
    const headers = ['Code', 'Name', 'Type', 'Level', 'SAT Code', 'Account Use'];
    const csvContent = [
      headers.join(','),
      ...accounts.map(account => [
        account.code,
        `"${account.name}"`,
        account.account_type,
        account.level,
        account.sat_code || '',
        account.account_use || ''
      ].join(','))
    ].join('\n');

    downloadCsv(csvContent, 'chart_of_accounts.csv');
    toast.success('Chart of accounts exported successfully');
  },

  importAccounts: async (file: File, userId: string): Promise<boolean> => {
    if (file.type !== "text/csv") {
      toast.error("Please upload a CSV file");
      return false;
    }

    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0];

      if (!headers.includes('Code') || !headers.includes('Name') || !headers.includes('Type')) {
        toast.error("Invalid CSV format. Please use the correct template");
        return false;
      }

      const codeIndex = headers.indexOf('Code');
      const nameIndex = headers.indexOf('Name');
      const typeIndex = headers.indexOf('Type');
      const levelIndex = headers.indexOf('Level');
      const satCodeIndex = headers.indexOf('SAT Code');
      const accountUseIndex = headers.indexOf('Account Use');

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 3) continue;

        const { error } = await supabase
          .from('chart_of_accounts')
          .insert({
            code: row[codeIndex]?.trim(),
            name: row[nameIndex]?.trim().replace(/^"|"$/g, ''),
            account_type: row[typeIndex]?.trim(),
            level: row[levelIndex] ? parseInt(row[levelIndex]) : 1,
            sat_code: satCodeIndex >= 0 ? row[satCodeIndex]?.trim() : null,
            account_use: accountUseIndex >= 0 ? row[accountUseIndex]?.trim() : null,
            user_id: userId,
          });

        if (error) {
          console.error("Error importing row:", error);
          toast.error(`Error importing account ${row[codeIndex]}: ${error.message}`);
          return false;
        }
      }

      toast.success("Accounts imported successfully");
      return true;
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast.error("Error processing CSV file");
      return false;
    }
  }
};

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
