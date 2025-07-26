
import { Input } from "@/components/ui/input";

interface FileUploadFieldProps {
  label: string;
  onChange: (file: File | null) => void;
  required?: boolean;
}

export const FileUploadField = ({ label, onChange, required = false }: FileUploadFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input
        type="file"
        required={required}
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  );
};
