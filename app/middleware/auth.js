import common from 'hmh-bfm-nodejs-common';

import errors from '../models/errors';


const requireServiceToken = common.middleware.auth.requireServiceToken;
const requireUserOrServiceToken = common.middleware.auth.requireUserOrServiceToken;

async function requireUserTokenOrRequestorParameter(swatchCtx, next) {
  if (!swatchCtx || !swatchCtx.auth) {
    throw errors.codes.ERROR_CODE_AUTH_NO_TOKEN;
  }

  const token = swatchCtx.auth;
  if (token.tokenType === common.auth.tokens.USER_TOKEN) {
    const requestor = swatchCtx.params.requestor;
    if (!requestor) {
      swatchCtx.logger.info(`Missing requestor param set to token user: ${token.userId}`);
      swatchCtx.params.requestor = token.userId;
    } else if (requestor !== token.userId) {
      swatchCtx.logger.warn(`Existing requestor param does not match token user: ${token.userId}`);
      throw errors.codes.ERROR_CODE_INVALID_USER;
    }

    swatchCtx.logger.info(`Successfully authenticated user token: ${swatchCtx.req.url}`);
  } else if (token.tokenType === common.auth.tokens.SERVICE_TOKEN) {
    const requestor = swatchCtx.params.requestor;
    if (!requestor) {
      throw errors.codes.ERROR_CODE_USER_NOT_FOUND;
    }

    swatchCtx.logger.info(`Successfully authenticated service token with user ${requestor}: ${swatchCtx.req.url}`);
  } else {
    throw errors.codes.ERROR_CODE_AUTH_NO_TOKEN;
  }

  await next();
}

export default {
  requireServiceToken,
  requireUserOrServiceToken,
  requireUserTokenOrRequestorParameter,
};
