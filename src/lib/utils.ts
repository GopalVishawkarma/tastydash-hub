
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function generateOrderId(): string {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `OD${timestamp}${random}`;
}

export function validateCardNumber(cardNumber: string): boolean {
  // Basic validation for 16-digit card (for demo purposes)
  const cleaned = cardNumber.replace(/\s+/g, '');
  return /^\d{16}$/.test(cleaned);
}

export function validateExpiryDate(expiryDate: string): boolean {
  // Format: MM/YY
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
    return false;
  }
  
  const [monthStr, yearStr] = expiryDate.split('/');
  const month = parseInt(monthStr, 10);
  const year = parseInt('20' + yearStr, 10);
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  
  // Check if month is valid
  if (month < 1 || month > 12) {
    return false;
  }
  
  // Check if the card is not expired
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }
  
  return true;
}

export function validateCVV(cvv: string): boolean {
  // Basic validation for 3-digit CVV (for demo purposes)
  return /^\d{3}$/.test(cvv);
}

export function shortenText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
