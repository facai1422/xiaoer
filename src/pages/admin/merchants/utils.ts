
export const formatCommission = (commission: any) => {
  if (!commission) return '';
  if (typeof commission === 'string') return commission;
  if (Array.isArray(commission)) {
    return commission.map(c => `${c.name}: ${c.rate}`).join('\n');
  }
  return JSON.stringify(commission);
};
