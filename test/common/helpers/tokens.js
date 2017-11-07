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
const internalUserToken = `SIF_HMACSHA256 ${validUserToken}`;


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

// Sample valid user token that will authenticate via LinkerD that our auth adapter
//  should be able to decode. Token format is: [AAAA].[AAAAAAA].[AAAAA] with no hash
const linkerdUserToken = 'SIF_HMACSHA256 ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKQklGTmhiWEJzWlNCSmMzTjFaWElpTENKaGRXUWlPaUpCSUZOaGJYQnNaU0JCZFdScFpXNWpaU0lzSW1saGRDSTZNVFV3TmpZeE5qSTFNU3dpYzNWaUlqb2lZMjQ5UzI5aWVTQlNiMjFoWjNWbGNtRXNkV2xrUFZGQlZHVmhZMmhsY2pGZk9USXdNREEzTVRjc2RXNXBjWFZsU1dSbGJuUnBabWxsY2oxalptTTNNalEyTnkwd1ptVXlMVFExT1dZdE9EbGhNaTB5T1dJNE16WTBPVFUzWkdJc2J6MDVNakF3TURjeE55eGtZejA1TWpBd01EY3hOaUlzSW1oMGRIQTZMeTkzZDNjdWFXMXpaMnh2WW1Gc0xtOXlaeTlwYlhOd2RYSnNMMnhwY3k5Mk1TOTJiMk5oWWk5d1pYSnpiMjRpT2xzaVNXNXpkSEoxWTNSdmNpSmRMQ0prYVhOMFgybGtJam9pWTJRNE5UY3dNR1F0WldFMk5TMDBOREV4TFRreVkyRXRNbUU1T0dOaE5qa3pNemt6SWl3aWMyTm9iMjlzWDJsa0lqb2laR001TldVMk0yUXRNbU01WWkwME4yTm1MV0ZsTnpJdE1HWm1abVppWVdVMlptSXlJaXdpYzJOb2IyOXNYM0psWm1sa0lqb2laR001TldVMk0yUXRNbU01WWkwME4yTm1MV0ZsTnpJdE1HWm1abVppWVdVMlptSXlJaXdpVUd4aGRHWnZjbTFKWkNJNklrbEVVeUlzSW1OdmJuUmxlSFJKWkNJNklpSXNJbVJwYzNSZmNtVm1hV1FpT2lKalpEZzFOekF3WkMxbFlUWTFMVFEwTVRFdE9USmpZUzB5WVRrNFkyRTJPVE16T1RNaUxDSnpZMmh2YjJ4ZlkyRjBaV2R2Y25raU9pSWlMQ0pxZEdraU9pSmxNV1JpT0dRMU1pMWhZV0k0TFRReE9HUXRZamt6Tmkwek5EVXpPRFkzWkRrd05tUWlMQ0pqYkdsbGJuUmZhV1FpT2lJeE5USmpaV1ExTUMweE16WTVMVFJpTVRrdE9HSXlOaTA0WmpOa05XUTVZbVprTm1FdWFHMW9ZMjh1WTI5dElpd2laWGh3SWpveE5UTTNOakUyTkRBMmZRLkNMaDVKWmhkVjlMTVc1Z1VqdHhfWnJXVnZYaDJBbE01NjlkMVFYdGFkRlk=';

// Sample valid user token that will authenticate via LinkerD that our auth adapter
//  should be able to decode. Token format is: [AAAA].[AAAAAAA].[AAAAA]:[HASH] appended
const linkerdUserTokenHash = 'SIF_HMACSHA256 ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKb2RIUndjem92TDJsa1pXNTBhWFI1TG1Gd2FTNW9iV2hqYnk1amIyMGlMQ0poZFdRaU9pSm9kSFJ3T2k4dmQzZDNMbWh0YUdOdkxtTnZiU0lzSW1saGRDSTZNVFV3T1RjeU56WXhPU3dpYzNWaUlqb2lZMjVjZFRBd00yUkRZVzFrWlc0Z1MyeGxhVzRzZFdsa1hIVXdNRE5rVVVGVVpXRmphR1Z5TVY4NU1qQXdNRGcwTVY5alpYSjBMSFZ1YVhGMVpVbGtaVzUwYVdacFpYSmNkVEF3TTJRd01UUXpZMk01T1MweVlUUmpMVFE1TURFdE9EUXdOUzB4WkRSaFkyWmxOR1EwWmpJc2IxeDFNREF6WkRreU1EQXdPRFF4TEdSalhIVXdNRE5rT1RJd01EQTROREFpTENKb2RIUndPaTh2ZDNkM0xtbHRjMmRzYjJKaGJDNXZjbWN2YVcxemNIVnliQzlzYVhNdmRqRXZkbTlqWVdJdmNHVnljMjl1SWpwYklrbHVjM1J5ZFdOMGIzSWlYU3dpWkdsemRGOXBaQ0k2SW1Jd01qWmxaR0kzTFRObE5tRXRORGcyWVMwNVl6RTNMV1V6Tm1FNU1UaGxZak5qTXlJc0luTmphRzl2YkY5cFpDSTZJakExTVRJeE1EVTBMV0U0WXpjdE5EVTJNeTFoT0RVeUxUWXdPRFl3TXpBMU5HSm1PQ0lzSW5OamFHOXZiRjl5WldacFpDSTZJakExTVRJeE1EVTBMV0U0WXpjdE5EVTJNeTFoT0RVeUxUWXdPRFl3TXpBMU5HSm1PQ0lzSWxCc1lYUm1iM0p0U1dRaU9pSkpSRk1pTENKamIyNTBaWGgwU1dRaU9pSWlMQ0prYVhOMFgzSmxabWxrSWpvaVlqQXlObVZrWWpjdE0yVTJZUzAwT0RaaExUbGpNVGN0WlRNMllUa3hPR1ZpTTJNeklpd2ljMk5vYjI5c1gyTmhkR1ZuYjNKNUlqb2lJaXdpYW5ScElqb2lZelptWkRSaFltRXRaamd4WkMwMFltWmtMV0ZtTVdFdFpqazVZVFZsTnpZeE56TmlJaXdpWTJ4cFpXNTBYMmxrSWpvaU1UVXlZMlZrTlRBdE1UTTJPUzAwWWpFNUxUaGlNall0T0dZelpEVmtPV0ptWkRaaExtaHRhR052TG1OdmJTSXNJbVY0Y0NJNk1UVXdPVGd4TkRBeE9YMC5hUnliYm5FcW9JWjJRcTdlajR0SGtEZnJsV2hpS3JSVVJWTHlhLU00T3lNOjlzWHQxSWkva1NMeFpkc1J6TEhWQ0RvVG1YUEx6K3haeTJPRzVabHhybkk9Cg==';

const userTokens = {
  external: linkerdUserToken,
  externalHash: linkerdUserTokenHash,
  internal: internalUserToken,
};

export default {
  expiredToken,
  serviceToken,
  userTokens,
};
