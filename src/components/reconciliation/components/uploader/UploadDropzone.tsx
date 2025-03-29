
import { Upload, CheckCircle } from "lucide-react";

interface UploadDropzoneProps {
  file: File | null;
  uploadSuccess: boolean;
  acceptedTypes: string;
  uploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadDropzone({
  file,
  uploadSuccess,
  acceptedTypes,
  uploading,
  onFileChange
}: UploadDropzoneProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
      <div className="flex flex-col items-center justify-center space-y-2">
        {uploadSuccess ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="mr-2 h-5 w-5" />
            <span>Archivo subido correctamente</span>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-gray-400" />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {file ? file.name : "Seleccione un archivo o arrástrelo aquí"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {acceptedTypes.split(',').join(', ')}
              </p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="sr-only"
              onChange={onFileChange}
              accept={acceptedTypes}
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
            >
              Seleccionar Archivo
            </label>
          </>
        )}
      </div>
    </div>
  );
}
