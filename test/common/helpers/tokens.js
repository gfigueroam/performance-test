import { createToken } from 'grid-framework/lib/token_validator';
import jwtSecret from 'grid-framework/lib/token_validator/secrets';

import config from '../../../app/config';

const secret = jwtSecret.jwt_secret;
const clientSecret = jwtSecret.client_secret;

const metadata = {
  aud: 'http://www.hmhco.com',
  client_id: '152ced50-1369-4b19-8b26-8f3d5d9bfd6a.hmhco.com',
  dist_refid: '4818784e-188d-41ce-9581-8a0d12c0d028',
  exp: new Date().getTime(),
  'http://www.imsglobal.org/imspurl/lis/v1/vocab/person': ['Learner'],
  iat: 1465436878,
  iss: 'https://identity.api.hmhco.com',
  PlatformId: 'HMH1',
  school_category: '',
  school_refid: '0e24f582-6d1e-45f6-8eec-06cc6967450d',
  sub: [
    'cn=Sc5G8StU1 IlamValudhi',
    'uid=core2_dist1sch5G8s1',
    'uniqueIdentifier=e0f96e77-55b5-493f-b347-42f8c7907072',
    'o=99200005',
    'dc=99200000',
  ].join(','),
};

const validUserToken = createToken(metadata, secret, clientSecret);
const userToken = `SIF_HMACSHA256 ${validUserToken}`;


const expiredMetadata = {
  aud: 'http://www.hmhco.com',
  client_id: '152ced50-1369-4b19-8b26-8f3d5d9bfd6a.hmhco.com',
  contextId: 'hmof',
  dist_refid: '11c9eb86-750a-446a-b413-8b96ba19481f',
  exp: 1464627857,
  'http://www.imsglobal.org/imspurl/lis/v1/vocab/person': ['Administrator'],
  iat: 1464620653,
  iss: 'https://identity.api.hmhco.com',
  PlatformId: 'HMOF',
  school_category: '',
  school_refid: '11c9eb86-750a-446a-b413-8b96ba19481f',
  sub: [
    'cn=DADMINTEST1',
    'uid=DADMINTEST1',
    'uniqueIdentifier=fa96843d-d00c-4045-c7ed-6cfce3f12eca',
    'o=88200198',
    'dc=88200198',
    'st=N/A',
    'c=N/A',
  ].join(','),
};
const expiredUserToken = createToken(expiredMetadata, secret, clientSecret);
const expiredToken = `SIF_HMACSHA256 ${expiredUserToken}`;

const serviceToken = config.get('uds:test_service_token');


export default {
  expiredToken,
  serviceToken,
  userToken,
};
