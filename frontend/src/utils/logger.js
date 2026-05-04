const IS_PROD = import.meta.env.PROD;

const logger = {
  info: (message, data = {}) => {
    if (!IS_PROD) {
      console.log(`[INFO] ${message}`, data);
    }
  },
  warn: (message, data = {}) => {
    console.warn(`[WARN] ${message}`, data);
  },
  error: (message, error = {}) => {
    console.error(`[ERROR] ${message}`, error);
    // In production, you would send this to Sentry/LogRocket here
  },
  api: (method, url, status, error = null) => {
    const msg = `${method.toUpperCase()} ${url} -> ${status}`;
    if (error) {
      logger.error(`API_FAILURE: ${msg}`, error);
    } else {
      logger.info(`API_SUCCESS: ${msg}`);
    }
  }
};

export default logger;
