import common from 'hmh-bfm-nodejs-common';

const udsErrorCodes = {
  ERROR_CODE_APP_NOT_FOUND: 'app_not_found',

  ERROR_CODE_AUTHZ_ACCESS_DENIED: 'authz_access_denied',
  ERROR_CODE_AUTHZ_NOT_FOUND: 'authz_not_found',

  ERROR_CODE_INVALID_APP: 'invalid_app',
  ERROR_CODE_INVALID_ARG_NAME: 'invalid_arg_name',
  ERROR_CODE_INVALID_AUTHZ: 'invalid_authz',
  ERROR_CODE_INVALID_CREDENTIALS: 'invalid_credentials',
  ERROR_CODE_INVALID_CTX: 'invalid_ctx',
  ERROR_CODE_INVALID_DATA: 'invalid_data',
  ERROR_CODE_INVALID_DATA_TYPE: 'invalid_data_type',
  ERROR_CODE_INVALID_KEY: 'invalid_key',
  ERROR_CODE_INVALID_NAME: 'invalid_name',
  ERROR_CODE_INVALID_QUOTA: 'invalid_quota',
  ERROR_CODE_INVALID_SHARE_ID: 'invalid_share_id',
  ERROR_CODE_INVALID_URL: 'invalid_url',
  ERROR_CODE_INVALID_USER: 'invalid_user',

  ERROR_CODE_KEY_NOT_FOUND: 'key_not_found',
  ERROR_CODE_MISSING_ARG: 'missing_arg',
  ERROR_CODE_NAME_IN_USE: 'name_in_use',
  ERROR_CODE_QUOTA_EXCEEDED: 'quota_exceeded',
  ERROR_CODE_SHARE_ID_NOT_FOUND: 'share_id_not_found',
  ERROR_CODE_USER_NOT_FOUND: 'user_not_found',
};

const commonErrorCodes = common.utils.errors.codes;

const codes = Object.assign(
  {},
  udsErrorCodes,
  commonErrorCodes,
);

export default codes;
