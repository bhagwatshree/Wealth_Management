export const formatDate = (dateArray) => {
  if (!dateArray || !Array.isArray(dateArray)) return '-';
  const [y, m, d] = dateArray;
  return `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`;
};

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount == null) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const fineractDateFormat = 'dd MMMM yyyy';
export const fineractLocale = 'en';

export const toFineractDate = (date) => {
  const d = new Date(date);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};
