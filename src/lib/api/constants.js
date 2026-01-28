/**
 * API Constants and Helper Functions
 */

/**
 * Order status constants - Based on delivery date fields
 */
export const ORDER_DELIVERY_STATUS = {
  PLACED: "placed",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
};

/**
 * Get order delivery status from date fields
 */
export const getOrderDeliveryStatus = (order) => {
  if (order.order_delivered_date) return ORDER_DELIVERY_STATUS.DELIVERED;
  if (order.out_for_delivery_date)
    return ORDER_DELIVERY_STATUS.OUT_FOR_DELIVERY;
  if (order.order_shipped_date) return ORDER_DELIVERY_STATUS.SHIPPED;
  if (order.order_confirmed_date) return ORDER_DELIVERY_STATUS.CONFIRMED;
  if (order.order_placed_date) return ORDER_DELIVERY_STATUS.PLACED;
  return null;
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
};

/**
 * Validate pagination parameters
 */
export const validatePaginationParams = (page, limit) => {
  const validPage = Math.max(
    PAGINATION.DEFAULT_PAGE,
    parseInt(page) || PAGINATION.DEFAULT_PAGE,
  );
  const validLimit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(PAGINATION.MIN_LIMIT, parseInt(limit) || PAGINATION.DEFAULT_LIMIT),
  );

  return { page: validPage, limit: validLimit };
};

/**
 * Calculate pagination offset
 */
export const getPaginationOffset = (page, limit) => {
  return (page - 1) * limit;
};

/**
 * Calculate total pages
 */
export const calculateTotalPages = (total, limit) => {
  return Math.ceil(total / limit);
};

/**
 * Product validation rules
 */
export const PRODUCT_VALIDATION = {
  NAME_MIN: 1,
  NAME_MAX: 255,
  DESCRIPTION_MAX: 2000,
  IMAGE_URL_MAX: 500,
  UNIT_MAX: 50,
  WEIGHT_MAX: 100,
  BADGE_MAX: 100,
  RATING_MIN: 0,
  RATING_MAX: 5,
  REVIEW_COUNT_MIN: 0,
  BACKGROUND_COLOR_MAX: 50,
};

/**
 * Category validation rules
 */
export const CATEGORY_VALIDATION = {
  NAME_MIN: 1,
  NAME_MAX: 255,
  ICON_MAX: 500,
  BACKGROUND_COLOR_MAX: 50,
  ICON_COLOR_MAX: 50,
};

/**
 * Order validation rules
 */
export const ORDER_VALIDATION = {
  ITEM_COUNT_MIN: 1,
  TOTAL_AMOUNT_MIN: 0,
};

/**
 * Order Item validation rules
 */
export const ORDER_ITEM_VALIDATION = {
  QUANTITY_MIN: 1,
  PRICE_MIN: 0,
};

/**
 *SUBTITLE_MAX: 500,
  IMAGE const BANNER_VALIDATION = {
  TITLE_MIN: 1,
  TITLE_MAX: 255,
  DESCRIPTION_MAX: 1000,
  IMAGE_URL_MAX: 500,
  LINK_URL_MAX: 500,
};

/**
 * Get status code description
 */
export const getStatusDescription = (statusCode) => {
  const descriptions = {
    200: "OK",
    201: "Created",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    500: "Internal Server Error",
    503: "Service Unavailable",
  };

  return descriptions[statusCode] || "Unknown";
};

/**
 * Check if status code is success (2xx)
 */
export const isSuccessStatus = (statusCode) => {
  return statusCode >= 200 && statusCode < 300;
};

/**
 * Check if status code is client error (4xx)
 */
export const isClientError = (statusCode) => {
  return statusCode >= 400 && statusCode < 500;
};

/**
 * Check if status code is server error (5xx)
 */
export const isServerError = (statusCode) => {
  return statusCode >= 500 && statusCode < 600;
};

/**
 * Format date for API responses
 */
export const formatDate = (date) => {
  if (typeof date === "string") {
    return date;
  }
  return new Date(date).toISOString();
};

/**
 * Parse JSON safely
 */
export const parseJSON = (json) => {
  try {
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
};

/**
 * Create pagination info from parameters
 */
export const createPaginationInfo = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    pages: calculateTotalPages(total, limit),
    hasNextPage: page < calculateTotalPages(total, limit),
    hasPreviousPage: page > 1,
  };
};

/**
 * Sanitize user input (basic)
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") {
    return input;
  }
  return input.trim().substring(0, 5000);
};

/**
 * Validate array of items (e.g., order items)
 */
export const validateItemsArray = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, error: "Items must be a non-empty array" };
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.product_id) {
      return { valid: false, error: `Item ${i + 1}: product_id is required` };
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return {
        valid: false,
        error: `Item ${i + 1}: quantity must be a positive integer`,
      };
    }
    if (typeof item.price !== "number" || item.price < 0) {
      return {
        valid: false,
        error: `Item ${i + 1}: price must be a non-negative number`,
      };
    }
  }

  return { valid: true };
};

/**
 * Calculate order total from items
 */
export const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

/**
 * Check if date is in valid format (ISO 8601)
 */
export const isValidISODate = (dateString) => {
  try {
    const date = new Date(dateString);
    return (
      date instanceof Date && !isNaN(date) && dateString === date.toISOString()
    );
  } catch {
    return false;
  }
};
