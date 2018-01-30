import auth from '../auth';
import errors from '../models/errors';

async function requireServiceToken(ctx, next) {
  if (!ctx || !ctx.swatchCtx || !ctx.swatchCtx.auth) {
    throw errors.codes.ERROR_CODE_AUTH_NO_TOKEN;
  }

  if (ctx.swatchCtx.auth.tokenType !== auth.tokens.SERVICE_TOKEN) {
    throw errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE;
  }

  ctx.swatchCtx.logger.info(`Successfully authenticated service token: ${ctx.request.url}`);

  await next();
}

async function requireUserTokenOrRequestorParameter(ctx, next) {
  if (!ctx || !ctx.swatchCtx || !ctx.swatchCtx.auth) {
    throw errors.codes.ERROR_CODE_AUTH_NO_TOKEN;
  }

  const tokenType = ctx.swatchCtx.auth.tokenType;
  if (tokenType === auth.tokens.USER_TOKEN) {
    ctx.swatchCtx.logger.info(`Successfully authenticated user token: ${ctx.request.url}`);
  } else if (tokenType === auth.tokens.SERVICE_TOKEN) {
    const requestor = ctx.swatchCtx.params.requestor;
    if (!requestor) {
      throw errors.codes.ERROR_CODE_USER_NOT_FOUND;
    }
    ctx.swatchCtx.logger.info(`Successfully authenticated service token with user ${requestor}: ${ctx.request.url}`);
  } else {
    throw errors.codes.ERROR_CODE_AUTH_NO_TOKEN;
  }

  await next();
}

export default {
  requireServiceToken,
  requireUserTokenOrRequestorParameter,
};
