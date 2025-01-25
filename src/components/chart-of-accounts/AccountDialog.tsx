import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccountForm } from "./AccountForm";

interface AccountDialogProps {
  isOpen: boolean;
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

export function AccountDialog({ isOpen, onClose, account, parentAccounts }: AccountDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{account ? "Edit Account" : "New Account"}</DialogTitle>
        </DialogHeader>
        <AccountForm
          onClose={onClose}
          account={account}
          parentAccounts={parentAccounts}
        />
      </DialogContent>
    </Dialog>
  );
}