const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

const auditLog = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.json.bind(res);
    res.json = async (body) => {
      try {
        if (req.user) {
          await AuditLog.create({
            user: req.user._id,
            action,
            resource,
            resourceId: req.params.id || body?.data?._id,
            details: { method: req.method, url: req.originalUrl },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            status: res.statusCode < 400 ? 'success' : 'failure',
          });
        }
      } catch (err) {
        logger.error('Audit log error:', err);
      }
      return originalSend(body);
    };
    next();
  };
};

module.exports = auditLog;
