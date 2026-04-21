/**
 * FirmEdge Utility Helpers
 */

/**
 * Formats a number as Indian Rupee (INR)
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Capitalizes the first letter of a string
 * @param {string} string 
 * @returns {string}
 */
export const capitalize = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Truncates text with ellipsis
 * @param {string} text 
 * @param {number} length 
 * @returns {string}
 */
export const truncate = (text, length = 30) => {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
};
