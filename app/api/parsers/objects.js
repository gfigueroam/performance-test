import errors from '../../models/errors';

function parseObject(param, error) {
  // Empty value should throw an error
  if (param === null || param === undefined) {
    throw error;
  }

  // Param must be an object and must not be an array
  if ((typeof param) !== 'object' || Array.isArray(param)) {
    throw error;
  }

  return param;
}

function parseData(param) {
  const error = errors.codes.ERROR_CODE_INVALID_DATA;
  return parseObject(param, error);
}

export default {
  parseData,
};
