import auth from '../auth';
import errors from '../models/errors';

async function requireUserTokenOrUserId(ctx, next) {
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
  requireUserTokenOrUserId,
};
