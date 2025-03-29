
import React from "react";
import { DollarSign } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AmountFilterProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

export const AmountFilter: React.FC<AmountFilterProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id={id}
          name={id}
          type="number"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="pl-8"
        />
      </div>
    </div>
  );
};
