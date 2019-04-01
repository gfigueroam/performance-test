import { createToken } from 'grid-framework/lib/token_validator';
import {
    jwt_secret as secret,
    client_secret as clientSecret,
  } from 'grid-framework/lib/token_validator/secrets';

const createSIFToken = props =>
  `SIF_HMACSHA256 ${createToken(
    {
      aud: 'http://www.hmhco.com',
      client_id: '152ced50-1369-4b19-8b26-8f3d5d9bfd6a.hmhco.com',
      contextId: '',
      dist_id: '4d101081-1e4b-4f3a-a0f7-a9b898b01db7',
      dist_refid: '4d101081-1e4b-4f3a-a0f7-a9b898b01db7',
      exp: 1553254594580,
      'http://www.imsglobal.org/imspurl/lis/v1/vocab/person': ['Instructor'],
      iat: 1529501914,
      iss: 'https://identity.api.hmhco.com',
      jti: 'f252ca71-8dcb-4d0b-a83d-d115f2d52e7f',
      PlatformId: 'IDS',
      refId: 'df38c7d3-e749-442f-8751-7af28f2202b1',
      school_category: '',
      school_id: '8faca4e4-b274-4f04-8233-8a78b0c7cef7',
      school_refid: '8faca4e4-b274-4f04-8233-8a78b0c7cef7',
      sub: 'cn=Teacher 10Classes,uid=teacher_10classes,o=92000475,dc=92000474',
      userInformation: {
        cn: 'Teacher 10Classes',
        dc: '92000474',
        o: '92000475',
        uid: 'teacher_10classes',
        uniqueIdentifier: 'df38c7d3-e749-442f-8751-7af28f2202b1',
      },
      ...props,
    },
    secret,
    clientSecret,
  )}`;

const noUniqueIdentifierKey = createSIFToken({
  sub: 'cn=Teacher 10Classes,uid=teacher_10classes,o=92000475,dc=92000474',
});
const noUniqueIdentifierValue = createSIFToken({
  sub:
    'cn=Teacher 10Classes,uid=teacher_10classes,uniqueIdentifier=,o=92000475,dc=92000474',
});
const emptyStringUniqueIdentifierValue = createSIFToken({
  sub:
      'cn=Teacher 10Classes,uid=teacher_10classes,uniqueIdentifier="",o=92000475,dc=92000474',
});

export {
    noUniqueIdentifierKey,
    noUniqueIdentifierValue,
    emptyStringUniqueIdentifierValue,
};
