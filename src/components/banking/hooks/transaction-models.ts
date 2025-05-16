
import { AccountTransaction } from "./transaction-types";

export interface Transaction extends AccountTransaction {
  isInitialBalance?: boolean;
  runningBalance?: number | null;
  beforeInitialDate?: boolean;
}
