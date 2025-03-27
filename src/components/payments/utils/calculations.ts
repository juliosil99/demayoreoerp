
interface Sale {
  price: number;
  comission?: number | null;
  retention?: number | null;
  shipping?: number | null;
}

export const calculateTotals = (sales: Sale[]) => {
  const subtotal = sales.reduce((sum, sale) => sum + (sale.price || 0), 0);
  
  const commissions = sales.reduce(
    (sum, sale) => sum + (sale.comission || 0), 
    0
  );
  
  const retentions = sales.reduce(
    (sum, sale) => sum + (sale.retention || 0), 
    0
  );
  
  const shipping = sales.reduce(
    (sum, sale) => sum + (sale.shipping || 0), 
    0
  );

  const total = subtotal;
  
  return {
    subtotal,
    commissions,
    retentions,
    shipping,
    total
  };
};
