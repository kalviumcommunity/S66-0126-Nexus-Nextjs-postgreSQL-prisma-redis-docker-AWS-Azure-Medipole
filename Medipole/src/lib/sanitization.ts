import sanitizeHtml from "sanitize-html";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Create DOMPurify instance for server-side use
const window = new JSDOM("").window;
const purify = DOMPurify(window);

/**
 * Sanitize HTML input to prevent XSS attacks
 * Removes all HTML tags and attributes by default
 * @param {string} input - User input to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input: string, options: any = {}): string => {
  if (!input || typeof input !== "string") {
    return "";
  }

  const defaultOptions = {
    allowedTags: [], // Remove all HTML tags
    allowedAttributes: {}, // Remove all attributes
    disallowedTagsMode: "escape", // Escape disallowed tags instead of removing
    ...options,
  };

  return sanitizeHtml(input, defaultOptions);
};

/**
 * Sanitize HTML for display (allows safe HTML)
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized HTML string
 */
export const sanitizeForDisplay = (input: string): string => {
  if (!input || typeof input !== "string") {
    return "";
  }

  const options = {
    allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a"],
    allowedAttributes: {
      a: ["href", "target"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
    },
  };

  return sanitizeHtml(input, options);
};

/**
 * Sanitize using DOMPurify (alternative method)
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeWithDOMPurify = (input: string): string => {
  if (!input || typeof input !== "string") {
    return "";
  }

  return purify.sanitize(input, {
    USE_PROFILES: { html: false }, // Remove all HTML
    FORBID_TAGS: ["script", "object", "embed", "link", "style"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  });
};

/**
 * Validate and sanitize email addresses
 * @param {string} email - Email to validate
 * @returns {string|null} Validated email or null if invalid
 */
export const sanitizeEmail = (email: string): string | null => {
  if (!email || typeof email !== "string") {
    return null;
  }

  // Basic email validation and sanitization
  const cleanEmail = email.trim().toLowerCase();

  // Simple regex for email validation (more comprehensive validation should be done with validator library)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(cleanEmail)) {
    return null;
  }

  return cleanEmail;
};

/**
 * Sanitize and validate user names
 * @param {string} name - Name to sanitize
 * @returns {string} Sanitized name
 */
export const sanitizeName = (name: string): string => {
  if (!name || typeof name !== "string") {
    return "";
  }

  // Remove extra whitespace and limit length
  return name.trim().replace(/\s+/g, " ").substring(0, 100); // Limit to 100 characters
};

/**
 * Sanitize URL parameters
 * @param {string} param - URL parameter to sanitize
 * @returns {string} Sanitized parameter
 */
export const sanitizeUrlParam = (param: string): string => {
  if (!param || typeof param !== "string") {
    return "";
  }

  // Encode special characters and remove dangerous patterns
  return encodeURIComponent(
    param
      .replace(/[<>'"&]/g, "") // Remove dangerous characters
      .trim()
  );
};

/**
 * Comprehensive input sanitization for API handlers
 * @param {Object} inputData - Object containing user inputs
 * @param {Array} fields - Array of field names to sanitize
 * @returns {Object} Object with sanitized fields
 */
export const sanitizeApiInput = (
  inputData: Record<string, any>,
  fields: string[] = []
): Record<string, any> => {
  if (!inputData || typeof inputData !== "object") {
    return {};
  }

  const sanitized: Record<string, any> = {};

  fields.forEach((field) => {
    if (field in inputData) {
      const value = inputData[field];

      if (typeof value === "string") {
        // Apply different sanitization based on field type
        switch (field.toLowerCase()) {
          case "email":
            sanitized[field] = sanitizeEmail(value);
            break;
          case "name":
          case "username":
            sanitized[field] = sanitizeName(value);
            break;
          case "comment":
          case "description":
          case "message":
            sanitized[field] = sanitizeForDisplay(value);
            break;
          default:
            sanitized[field] = sanitizeInput(value);
        }
      } else {
        // For non-string values, just copy them
        sanitized[field] = value;
      }
    }
  });

  return sanitized;
};

/**
 * Security logging utility
 * @param {string} message - Log message
 * @param {Object} context - Additional context
 */
export const logSecurityEvent = (
  message: string,
  context: Record<string, any> = {}
): void => {
  console.warn(`[SECURITY] ${message}`, {
    timestamp: new Date().toISOString(),
    ...context,
  });
};

// Export all utilities
export default {
  sanitizeInput,
  sanitizeForDisplay,
  sanitizeWithDOMPurify,
  sanitizeEmail,
  sanitizeName,
  sanitizeUrlParam,
  sanitizeApiInput,
  logSecurityEvent,
};
