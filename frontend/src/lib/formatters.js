/**
 * Swedish localization formatters for dates, numbers, and currency.
 * Provides consistent formatting throughout the SYLON application.
 */

/**
 * Format date in Swedish format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date (e.g., "19 november 2025")
 */
export const formatSwedishDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  } catch (error) {
    console.error('Error formatting Swedish date:', error);
    return String(date);
  }
};

/**
 * Format date and time in Swedish format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time (e.g., "19 november 2025 14:30")
 */
export const formatSwedishDateTime = (date) => {
  if (!date) return 'N/A';
  
  try {
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  } catch (error) {
    console.error('Error formatting Swedish date/time:', error);
    return String(date);
  }
};

/**
 * Format short date in Swedish format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date (e.g., "2025-11-19")
 */
export const formatSwedishShortDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(date));
  } catch (error) {
    console.error('Error formatting Swedish short date:', error);
    return String(date);
  }
};

/**
 * Format number in Swedish format with space as thousand separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number (e.g., 10000 → "10 000")
 */
export const formatSwedishNumber = (num) => {
  if (num === null || num === undefined) return 'N/A';
  
  try {
    return new Intl.NumberFormat('sv-SE').format(num);
  } catch (error) {
    console.error('Error formatting Swedish number:', error);
    return String(num);
  }
};

/**
 * Format number with decimal places in Swedish format
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number (e.g., 1234.56 → "1 234,56")
 */
export const formatSwedishDecimal = (num, decimals = 2) => {
  if (num === null || num === undefined) return 'N/A';
  
  try {
    return new Intl.NumberFormat('sv-SE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  } catch (error) {
    console.error('Error formatting Swedish decimal:', error);
    return String(num);
  }
};

/**
 * Format currency in Swedish Kronor (SEK)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount (e.g., 1500 → "1 500 kr")
 */
export const formatSEK = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  
  try {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    console.error('Error formatting SEK:', error);
    return String(amount) + ' kr';
  }
};

/**
 * Format currency in Swedish Kronor with decimals
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount (e.g., 1500.50 → "1 500,50 kr")
 */
export const formatSEKDecimal = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  
  try {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Error formatting SEK with decimals:', error);
    return String(amount) + ' kr';
  }
};

/**
 * Format distance in kilometers with Swedish number format
 * @param {number} km - Distance in kilometers
 * @returns {string} Formatted distance (e.g., "1 234,5 km")
 */
export const formatKilometers = (km) => {
  if (km === null || km === undefined) return 'N/A';
  
  try {
    return formatSwedishDecimal(km, 1) + ' km';
  } catch (error) {
    console.error('Error formatting kilometers:', error);
    return String(km) + ' km';
  }
};

/**
 * Format time duration in Swedish
 * @param {number} hours - Duration in hours
 * @returns {string} Formatted duration (e.g., "2,5 timmar")
 */
export const formatHours = (hours) => {
  if (hours === null || hours === undefined) return 'N/A';
  
  try {
    const formatted = formatSwedishDecimal(hours, 1);
    return hours === 1 ? `${formatted} timme` : `${formatted} timmar`;
  } catch (error) {
    console.error('Error formatting hours:', error);
    return String(hours) + ' timmar';
  }
};

/**
 * Format percentage in Swedish format
 * @param {number} percent - Percentage value (0-100)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage (e.g., "95,5 %")
 */
export const formatPercentage = (percent, decimals = 1) => {
  if (percent === null || percent === undefined) return 'N/A';
  
  try {
    return formatSwedishDecimal(percent, decimals) + ' %';
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return String(percent) + ' %';
  }
};

/**
 * Format fuel consumption (liters per 100km) in Swedish format
 * @param {number} consumption - Fuel consumption in L/100km
 * @returns {string} Formatted consumption (e.g., "7,5 L/100km")
 */
export const formatFuelConsumption = (consumption) => {
  if (consumption === null || consumption === undefined) return 'N/A';
  
  try {
    return formatSwedishDecimal(consumption, 1) + ' L/100km';
  } catch (error) {
    console.error('Error formatting fuel consumption:', error);
    return String(consumption) + ' L/100km';
  }
};

/**
 * Format fuel efficiency (kilometers per liter) in Swedish format
 * @param {number} efficiency - Fuel efficiency in km/L
 * @returns {string} Formatted efficiency (e.g., "13,3 km/L")
 */
export const formatFuelEfficiency = (efficiency) => {
  if (efficiency === null || efficiency === undefined) return 'N/A';
  
  try {
    return formatSwedishDecimal(efficiency, 1) + ' km/L';
  } catch (error) {
    console.error('Error formatting fuel efficiency:', error);
    return String(efficiency) + ' km/L';
  }
};
