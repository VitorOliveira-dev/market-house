/**
 * Validation Utilities
 * Helper functions for validation
 */

/**
 * Validate if string is not empty
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validate if number is positive
 */
export function isPositive(value: number): boolean {
  return value > 0;
}

/**
 * Validate if price is valid
 */
export function isValidPrice(value: number): boolean {
  return isPositive(value) && Number.isFinite(value);
}

/**
 * Validate if quantity is valid
 */
export function isValidQuantity(value: number): boolean {
  return isPositive(value) && Number.isFinite(value);
}

/**
 * Validate if date is valid
 */
export function isValidDate(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(d.getTime());
}
