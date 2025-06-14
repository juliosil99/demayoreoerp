
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ReceiverFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const ReceiverFilter: React.FC<ReceiverFilterProps> = ({
  value,
  onChange,
}) => {
  return (
    <div>
      <Label htmlFor="receiver-name" className="text-sm font-medium">
        Receptor
      </Label>
      <Input
        id="receiver-name"
        type="text"
        placeholder="Filtrar por nombre del receptor..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1"
      />
    </div>
  );
};
