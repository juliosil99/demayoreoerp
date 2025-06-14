
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface IssuerFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const IssuerFilter: React.FC<IssuerFilterProps> = ({
  value,
  onChange,
}) => {
  return (
    <div>
      <Label htmlFor="issuer-name" className="text-sm font-medium">
        Emisor
      </Label>
      <Input
        id="issuer-name"
        type="text"
        placeholder="Filtrar por nombre del emisor..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1"
      />
    </div>
  );
};
