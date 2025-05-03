/**
 * Utility functions for price calculations
 */

// VAT rate for window/door products
export const VAT_RATE = 0.23; // 23% VAT

/**
 * Calculate VAT amount from net price
 */
export const calculateVAT = (netPrice: number): number => {
  return netPrice * VAT_RATE;
};

/**
 * Calculate gross price (net + VAT)
 */
export const calculateGross = (netPrice: number): number => {
  return netPrice + calculateVAT(netPrice);
};

/**
 * Format price with currency
 */
export const formatPrice = (price: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(price);
};

/**
 * Format price without currency symbol
 */
export const formatPriceValue = (price: number): string => {
  return new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

/**
 * Round to 2 decimal places
 */
export const roundPrice = (price: number): number => {
  return Math.round(price * 100) / 100;
};
