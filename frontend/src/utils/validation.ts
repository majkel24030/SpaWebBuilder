/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength requirements
 * - At least 8 characters
 * - Contains at least one letter
 * - Contains at least one number
 */
export const isValidPassword = (password: string): boolean => {
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasMinLength && hasLetter && hasNumber;
};

/**
 * Validate dimensions based on product type
 * @param width Width in mm
 * @param height Height in mm
 * @param type Product type
 * @returns Object with validation result and optional error message
 */
export const validateDimensions = (
  width: number,
  height: number,
  type: string
): { valid: boolean; error?: string } => {
  // If width or height is not a number
  if (isNaN(width) || isNaN(height)) {
    return { valid: false, error: 'Wymiary muszą być liczbami' };
  }

  // Common minimum values
  const minWidth = 400;
  const minHeight = 400;
  
  // Type-specific maximum values
  let maxWidth = 3000;
  let maxHeight = 3000;
  
  // Adjust limits based on product type
  if (type.includes('Okno')) {
    maxWidth = 2500;
    maxHeight = 2500;
  } else if (type.includes('Drzwi balkonowe')) {
    maxWidth = 2000;
    maxHeight = 2400;
  } else if (type.includes('Drzwi wejściowe')) {
    maxWidth = 1500;
    maxHeight = 2300;
  }
  
  if (width < minWidth || height < minHeight) {
    return { 
      valid: false, 
      error: `Minimalne wymiary to ${minWidth}mm × ${minHeight}mm` 
    };
  }
  
  if (width > maxWidth || height > maxHeight) {
    return { 
      valid: false, 
      error: `Maksymalne wymiary dla tego typu to ${maxWidth}mm × ${maxHeight}mm` 
    };
  }
  
  return { valid: true };
};

/**
 * Validate offer form data
 */
export const validateOfferData = (
  klient: string,
  numer: string,
  data: string
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  if (!klient || klient.trim().length < 3) {
    errors.klient = 'Nazwa klienta jest wymagana (min. 3 znaki)';
  }
  
  if (!numer || !numer.match(/^[A-Z]+\/\d{4}\/\d{4}$/)) {
    errors.numer = 'Numer oferty powinien mieć format XX/RRRR/NNNN';
  }
  
  if (!data) {
    errors.data = 'Data jest wymagana';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
