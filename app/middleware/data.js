import errors from '../models/errors';
import types from '../models/system/types';

async function validateUserDataType(ctx, next) {
  const data = ctx.swatchCtx.params.data;
  const type = ctx.swatchCtx.params.type;

  // If there's no type specified, throw.
  if (!type) {
    throw errors.codes.ERROR_CODE_INVALID_DATA_TYPE;
  }

  // If the specified type is not registered in the type system, throw.
  if (!types[type]) {
    throw errors.codes.ERROR_CODE_INVALID_DATA_TYPE;
  }

  // Does the data parameter pass the validation specified by the type?
  if (!types[type].validate(data)) {
    throw errors.codes.ERROR_CODE_INVALID_DATA;
  }

  await next();
}

export default {
  validateUserDataType,
};
