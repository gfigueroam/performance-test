import common from 'hmh-bfm-nodejs-common';

import nconf from '../../../app/config';
import constants from '../../../app/utils/constants';
import logger from '../../../app/monitoring/logger';


const endpoint = nconf.get('uds:url:internal');

const BVT_REQUEST_HEADER = constants.UDS_BVT_REQUEST_HEADER;
const CONSISTENT_READ_HEADER = constants.UDS_CONSISTENT_READ_HEADER;

const config = { endpoint };
const headers = {
  BVT_REQUEST_HEADER,
  CONSISTENT_READ_HEADER,
};
const http = common.test.http.init(config, headers, logger);

export default http;
