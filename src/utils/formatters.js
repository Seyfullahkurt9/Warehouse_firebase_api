/**
 * Data formatting utilities
 */

// Format date to localized string
const formatDate = (date, locale = 'tr-TR') => {
  if (!date) return null;
  
  // If date is a Firestore Timestamp, convert to JS Date
  const jsDate = date.toDate ? date.toDate() : new Date(date);
  
  return jsDate.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Format date and time
const formatDateTime = (date, locale = 'tr-TR') => {
  if (!date) return null;
  
  // If date is a Firestore Timestamp, convert to JS Date
  const jsDate = date.toDate ? date.toDate() : new Date(date);
  
  return jsDate.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Format currency
const formatCurrency = (amount, currency = 'TRY', locale = 'tr-TR') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format number
const formatNumber = (number, locale = 'tr-TR') => {
  return new Intl.NumberFormat(locale).format(number);
};

// Format phone number
const formatPhoneNumber = (phoneNumber) => {
  // Clean the input
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  
  // Check if the number is Turkish format (10 or 11 digits)
  if (cleaned.length === 10) {
    // Format as 0XXX XXX XX XX
    return `0${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    // Format as 0XXX XXX XX XX
    return `${cleaned.substring(0, 1)}${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 9)} ${cleaned.substring(9, 11)}`;
  }
  
  // Return original if not matching expected format
  return phoneNumber;
};

// Format Turkish Tax Number with spaces
const formatTaxNumber = (taxNumber) => {
  // Clean the input
  const cleaned = ('' + taxNumber).replace(/\D/g, '');
  
  // Format tax number with proper spacing (Turkish VKN is typically 10 digits)
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 10)}`;
  }
  
  // Return original if not matching expected format
  return taxNumber;
};

// Remove sensitive fields from data objects
const sanitizeObject = (obj, sensitiveFields = ['sifre', 'password', 'personel_sifre']) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const sanitized = { ...obj };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }
  
  return sanitized;
};

module.exports = {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatNumber,
  formatPhoneNumber,
  formatTaxNumber,
  sanitizeObject
};
