/**
 * Simple validation utility without Zod dependency
 * Provides basic schema validation for API requests
 */

export class ValidationError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

/**
 * Create a validator object with chainable validation methods
 */
export const createValidator = (data) => {
  const errors = {};

  return {
    string(field, options = {}) {
      const value = data[field];
      if (
        options.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors[field] = `${field} is required`;
      } else if (value && typeof value !== "string") {
        errors[field] = `${field} must be a string`;
      } else if (value && options.min && value.length < options.min) {
        errors[field] = `${field} must be at least ${options.min} characters`;
      } else if (value && options.max && value.length > options.max) {
        errors[field] = `${field} must be at most ${options.max} characters`;
      }
      return this;
    },

    number(field, options = {}) {
      const value = data[field];
      if (options.required && (value === undefined || value === null)) {
        errors[field] = `${field} is required`;
      } else if (
        value !== undefined &&
        value !== null &&
        typeof value !== "number"
      ) {
        errors[field] = `${field} must be a number`;
      } else if (value && options.min !== undefined && value < options.min) {
        errors[field] = `${field} must be at least ${options.min}`;
      } else if (value && options.max !== undefined && value > options.max) {
        errors[field] = `${field} must be at most ${options.max}`;
      }
      return this;
    },

    boolean(field, options = {}) {
      const value = data[field];
      if (options.required && (value === undefined || value === null)) {
        errors[field] = `${field} is required`;
      } else if (
        value !== undefined &&
        value !== null &&
        typeof value !== "boolean"
      ) {
        errors[field] = `${field} must be a boolean`;
      }
      return this;
    },

    array(field, options = {}) {
      const value = data[field];
      if (
        options.required &&
        (value === undefined || value === null || !Array.isArray(value))
      ) {
        errors[field] = `${field} is required and must be an array`;
      } else if (value && !Array.isArray(value)) {
        errors[field] = `${field} must be an array`;
      } else if (value && options.minItems && value.length < options.minItems) {
        errors[field] = `${field} must have at least ${options.minItems} items`;
      }
      return this;
    },

    email(field, options = {}) {
      const value = data[field];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (
        options.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors[field] = `${field} is required`;
      } else if (value && !emailRegex.test(value)) {
        errors[field] = `${field} must be a valid email`;
      }
      return this;
    },

    enum(field, enumValues, options = {}) {
      const value = data[field];
      if (options.required && (value === undefined || value === null)) {
        errors[field] = `${field} is required`;
      } else if (value && !enumValues.includes(value)) {
        errors[field] = `${field} must be one of: ${enumValues.join(", ")}`;
      }
      return this;
    },

    getErrors() {
      return errors;
    },

    isValid() {
      return Object.keys(errors).length === 0;
    },

    validate() {
      if (!this.isValid()) {
        throw new ValidationError("Validation failed", errors);
      }
      return data;
    },
  };
};
