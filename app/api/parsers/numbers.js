import errors from '../../models/errors';

function parseNumber(param, error) {
  // Empty value should throw an error
  if (param === null || param === undefined) {
    throw error;
  }

  const num = Number(param);
  if (isNaN(num)) {
    throw error;
  }
  return num;
}

function parseQuota(param) {
  const error = errors.codes.ERROR_CODE_INVALID_QUOTA;
  return parseNumber(param, error);
}

export default {
  parseQuota,
};
