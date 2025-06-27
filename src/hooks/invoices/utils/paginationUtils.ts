
export const validatePaginationParams = (
  page: number,
  itemsPerPage: number,
  totalCount: number
) => {
  const safeItemsPerPage = Math.max(1, itemsPerPage);
  const maxPage = Math.max(1, Math.ceil((totalCount || 0) / safeItemsPerPage));
  const safePage = Math.min(Math.max(1, page), maxPage);
  
  const from = (safePage - 1) * safeItemsPerPage;
  const to = from + safeItemsPerPage - 1;
  
  return { safePage, safeItemsPerPage, from, to };
};
