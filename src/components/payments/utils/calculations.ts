
interface Sale {
  price?: number;
  comission?: number;
  shipping?: number;
  retention?: number;
}

export const calculateTotals = (sales: Sale[]) => {
  return sales?.reduce((acc, sale) => ({
    subtotal: acc.subtotal + (sale.price || 0),
    commission: acc.commission + (sale.comission || 0),
    shipping: acc.shipping + (sale.shipping || 0),
    retention: acc.retention + (sale.retention || 0),
    total: acc.total + ((sale.price || 0) - (sale.comission || 0) - (sale.shipping || 0) - (sale.retention || 0))
  }), {
    subtotal: 0,
    commission: 0,
    shipping: 0,
    retention: 0,
    total: 0
  });
};
