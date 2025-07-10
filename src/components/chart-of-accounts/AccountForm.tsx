import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AccountFormProps {
  onClose: () => void;
  account?: {
    id: string;
    code: string;
    name: string;
    account_type: string;
    sat_code?: string;
    account_use?: string;
    parent_id?: string | null;
    level: number;
  };
  parentAccounts: Array<{ id: string; code: string; name: string }>;
}

export function AccountForm({ onClose, account, parentAccounts }: AccountFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: account?.code || "",
    name: account?.name || "",
    account_type: account?.account_type || "asset",
    sat_code: account?.sat_code || "",
    account_use: account?.account_use || "",
    parent_id: account?.parent_id || null,
    level: account?.level || 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to perform this action");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        ...formData,
        user_id: user.id,
        is_global: false, // All user-created accounts are personal, not global
      };

      let result;
      if (account) {
        const { error } = await supabase
          .from("chart_of_accounts")
          .update(data)
          .eq("id", account.id)
          .eq("user_id", user.id); // Add user_id check
        
        if (error) throw error;
        toast.success("Account updated successfully");
      } else {
        const { error } = await supabase
          .from("chart_of_accounts")
          .insert([data]);
        
        if (error) throw error;
        toast.success("Account created successfully");
      }

      onClose();
    } catch (error) {
      console.error("Error saving account:", error);
      toast.error("Error saving account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Code</label>
        <Input
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Account Type</label>
        <Select
          value={formData.account_type}
          onValueChange={(value) => setFormData({ ...formData, account_type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asset">Asset</SelectItem>
            <SelectItem value="liability">Liability</SelectItem>
            <SelectItem value="equity">Equity</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Parent Account</label>
        <Select
          value={formData.parent_id || "none"}
          onValueChange={(value) => setFormData({ ...formData, parent_id: value === "none" ? null : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select parent account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No parent</SelectItem>
            {parentAccounts.map((parent) => (
              <SelectItem key={parent.id} value={parent.id}>
                {parent.code} - {parent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">SAT Code (optional)</label>
        <Input
          value={formData.sat_code}
          onChange={(e) => setFormData({ ...formData, sat_code: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Account Use (optional)</label>
        <Input
          value={formData.account_use}
          onChange={(e) => setFormData({ ...formData, account_use: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : account ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}