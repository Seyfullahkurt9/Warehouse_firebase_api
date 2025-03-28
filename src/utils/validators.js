/**
 * Input validation utilities
 */

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (for Turkish numbers)
const isValidTurkishPhone = (phone) => {
  // Remove spaces, parentheses, and hyphens
  const cleanPhone = phone.replace(/[\s()+-]/g, '');
  
  // Turkish phone validation: +90 or 0 followed by 10 digits
  // or just 10 digits starting with 5 (for mobile)
  if (cleanPhone.startsWith('+90')) {
    return /^\+90\d{10}$/.test(cleanPhone);
  } else if (cleanPhone.startsWith('0')) {
    return /^0\d{10}$/.test(cleanPhone);
  } else if (cleanPhone.startsWith('5')) {
    return /^5\d{9}$/.test(cleanPhone);
  }
  
  return false;
};

// Tax number validation (for Turkish tax numbers)
const isValidTaxNumber = (taxNumber) => {
  // Turkish tax number is 10 digits
  return /^\d{10}$/.test(taxNumber);
};

// Password strength validation
const isStrongPassword = (password) => {
  // At least 8 characters, at least one uppercase, one lowercase, one number
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
};

// Required fields validation
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields
  };
};

// Numeric validation
const isNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Non-negative number validation
const isNonNegativeNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num) && num >= 0;
};

// Positive number validation
const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num) && num > 0;
};

module.exports = {
  isValidEmail,
  isValidTurkishPhone,
  isValidTaxNumber,
  isStrongPassword,
  validateRequiredFields,
  isNumeric,
  isNonNegativeNumber,
  isPositiveNumber
};
