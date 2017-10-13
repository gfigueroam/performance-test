import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import jwtSecret from 'grid-framework/lib/token_validator/secrets';
import { hmhclients } from 'idm-nodejs-common';

import errors from '../models/errors';
import tokens from './tokens';

function getAuthHeader(ctx) {
  // Token must be passed in the Authorization header
  const header = ctx.request.headers.authorization;
  if (!header) {
    throw errors.codes.ERROR_CODE_AUTH_NO_TOKEN;
  }
  return header;
}

function getTokenInfo(ctx) {
  const header = getAuthHeader(ctx);
  const tokenData = header.split(' ');

  if (tokenData.length !== 2) {
    ctx.swatchCtx.logger.warn('Invalid format for Authorization header');
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }
  if (tokenData[0] !== 'SIF_HMACSHA256') {
    ctx.swatchCtx.logger.warn('Authorization header was not a SIF token');
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  const tokenBuffer = new Buffer(tokenData[1], 'base64');
  const decodedToken = tokenBuffer.toString();
  const splitDecodedToken = decodedToken.split(':');
  if (splitDecodedToken.length !== 2) {
    ctx.swatchCtx.logger.warn(`Invalid format for decoded SIF token: ${decodedToken}`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  return {
    body: splitDecodedToken[0],
    hash: splitDecodedToken[1].trim(),
    token: header,
  };
}

// Simple authAdapter for environments where DMPS needs to manually validate token
//  Assumes the token is unvalidated, checks for user token followed by service token
//  This adapter should be used for local environments and Jenkins/docker scenarios
//   where we don't have a LinkerD mesh layer handling requests and validating tokens
function simpleAuthAdapter(ctx) {
  const tokenInfo = getTokenInfo(ctx);
  const token = tokenInfo.token;

  try {
    // Verify token, which will throw if invalid or expired
    const metadata = jwt.verify(tokenInfo.body, jwtSecret.jwt_secret);

    // Add some logic to safely parse claims string and get unique user ID
    const subClaim = metadata.sub || '';
    const subClaims = subClaim.split(',');
    const userIdClaims = subClaims.filter(claim => (
      claim.includes('uniqueIdentifier=')),
    ).map(claim => (claim.split('=')[1] || 'Unknown'));
    const userId = userIdClaims[0] || 'Unknown';

    ctx.swatchCtx.logger.info(`Successfully validated user token: ${userId}`);
    return new tokens.UserToken(token);
  } catch (error) {
    // Token that failed JWT decoding must be a service token
    const serviceId = tokenInfo.body;

    const serviceClientContent = `${serviceId}:`;
    const serviceClientSecret = hmhclients[serviceId] || '';
    const generatedHash = crypto.createHmac('sha256', serviceClientSecret)
                                .update(serviceClientContent)
                                .digest('base64');

    if (tokenInfo.hash !== generatedHash) {
      ctx.swatchCtx.logger.warn(`Invalid hash for service token: ${generatedHash}`);
      throw errors.codes.ERROR_CODE_AUTH_INVALID;
    }

    ctx.swatchCtx.logger.info(`Successfully validated service token: ${serviceId}`);
    return new tokens.ServiceToken(token);
  }
}

// LinkerD authAdapter for environments where DMPS can rely on LinkerD for validation
//  This adapter should be used in dev/cert/int/prod where LinkerD will validate user
//   tokens and pass along service tokens and we can just extract it from Auth header
function linkerdAuthAdapter(ctx) {
  const header = getAuthHeader(ctx);
  ctx.swatchCtx.logger.warn('LinkerD auth adapter configured!');
  ctx.swatchCtx.logger.warn(`LinkerD auth adapter header: ${header}`);

  // For now just throw an error and block validation through LinkerD endpoints
  throw errors.codes.ERROR_CODE_AUTH_INVALID;
}

export default {
  linkerd: linkerdAuthAdapter,
  simple: simpleAuthAdapter,
};
