export function formatCurrency(amount: number, currency: string = 'VND'): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string, showDayOfWeek: boolean = false): string {
  const date = new Date(dateString);
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
  
  if (showDayOfWeek) {
    const dayName = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(date);
    // Capitalize first letter
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    return `${capitalizedDay}, ${formattedDate}`;
  }
  
  return formattedDate;
}

export function formatMonthYear(month: number, year: number): string {
  const date = new Date(year, month - 1);
  return new Intl.DateTimeFormat('vi-VN', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getMonthName(month: number): string {
  const date = new Date(2024, month - 1);
  return new Intl.DateTimeFormat('vi-VN', { month: 'long' }).format(date);
}
