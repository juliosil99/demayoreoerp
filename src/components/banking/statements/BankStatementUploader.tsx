
import { useStatementUpload } from "./hooks/useStatementUpload";
import { MonthYearSelector } from "./components/uploaders/MonthYearSelector";
import { FileInput } from "./components/uploaders/FileInput";
import { DescriptionField } from "./components/uploaders/DescriptionField";
import { UploadButton } from "./components/uploaders/UploadButton";

interface BankStatementUploaderProps {
  accountId: number;
  onSuccess?: () => void;
}

export function BankStatementUploader({ accountId, onSuccess }: BankStatementUploaderProps) {
  const {
    file,
    month,
    year,
    description,
    uploading,
    months,
    years,
    setMonth,
    setYear,
    setDescription,
    handleFileChange,
    handleUpload
  } = useStatementUpload({ accountId, onSuccess });

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <div className="grid gap-4">
        <MonthYearSelector
          month={month}
          year={year}
          months={months}
          years={years}
          onMonthChange={setMonth}
          onYearChange={setYear}
        />
        
        <FileInput
          file={file}
          onChange={handleFileChange}
          disabled={uploading}
        />
        
        <DescriptionField
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={uploading}
        />
        
        <UploadButton
          disabled={!file || !month || !year}
          uploading={uploading}
        />
      </div>
    </form>
  );
}
