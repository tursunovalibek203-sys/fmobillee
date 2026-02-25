// ==================== PROFESSIONAL RESPONSE HANDLER ====================

const { HTTP_STATUS } = require('../config/constants');

class ResponseHandler {
  static success(res, data, message = 'Success', statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, message, statusCode = HTTP_STATUS.INTERNAL_ERROR, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  static validationError(res, errors) {
    return this.error(res, 'Validatsiya xatosi', HTTP_STATUS.BAD_REQUEST, errors);
  }

  static notFound(res, message = 'Ma\'lumot topilmadi') {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND);
  }

  static unauthorized(res, message = 'Ruxsat berilmagan') {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  static created(res, data, message = 'Muvaffaqiyatli yaratildi') {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }
}

module.exports = ResponseHandler;
