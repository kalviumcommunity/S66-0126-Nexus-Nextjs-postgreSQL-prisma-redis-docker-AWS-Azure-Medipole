import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to combine class names with Tailwind CSS
 * @param inputs - Class values to combine
 * @returns Merged class string
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

/**
 * Utility function to validate email format
 * @param email - Email string to validate
 * @returns boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Utility function to capitalize first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Utility function to format phone number
 * @param phoneNumber - Phone number string to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phoneNumber;
};

/**
 * Utility function to validate password strength
 * @param password - Password string to validate
 * @returns boolean indicating if password meets criteria
 */
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};
