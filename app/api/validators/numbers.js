import errors from '../../models/errors';

const MAX_PER_USER_QUOTA = 1048576;

function validateQuota(param) {
  // Quota must be non-negative but not greater than system-max
  if (param <= 0 || param > MAX_PER_USER_QUOTA) {
    throw errors.codes.ERROR_CODE_INVALID_QUOTA;
  }
}

export default {
  validateQuota,
};
