
import { useState } from "react";
import { debugPayableExpenses } from "./services/payableService";
import { toast } from "sonner";

export function usePayableDebug() {
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);

  const debugPayable = async (payableId: string) => {
    try {
      setIsDebugging(true);
      console.log('🔍 Starting payable debug for:', payableId);
      
      const results = await debugPayableExpenses(payableId);
      setDebugResults(results);
      
      if (results) {
        console.log('🔍 Debug results:', results);
        
        if (results.debugInfo.potentialDuplicates > 1) {
          toast.warning(`Se encontraron ${results.debugInfo.potentialDuplicates} gastos potencialmente relacionados`);
        } else {
          toast.success('Debug completado - sin duplicaciones detectadas');
        }
      }
      
      return results;
    } catch (error) {
      console.error('❌ Debug error:', error);
      toast.error('Error al ejecutar debug');
      return null;
    } finally {
      setIsDebugging(false);
    }
  };

  const clearDebugResults = () => {
    setDebugResults(null);
  };

  return {
    debugPayable,
    clearDebugResults,
    isDebugging,
    debugResults
  };
}
