import errors from '../../models/errors';

function parseObject(param) {
  // Empty value should throw an error
  if (param === null || param === undefined) {
    throw errors.codes.ERROR_CODE_INVALID_DATA;
  }

  // Param must be an object and must not be an array
  if ((typeof param) !== 'object' || Array.isArray(param)) {
    throw errors.codes.ERROR_CODE_INVALID_DATA;
  }

  return param;
}

function parseData(param) {
  // Param can be a basic JS type
  if ((typeof param) === 'boolean') { return param; }
  if ((typeof param) === 'string') { return param; }
  if ((typeof param) === 'number') { return param; }

  // Param can also be an array
  if (Array.isArray(param)) { return param; }

  // Otherwise parse the param as a JSON object
  return parseObject(param);
}

function parseJsonData(param) {
  return parseObject(param);
}

export default {
  parseData,
  parseJsonData,
};
