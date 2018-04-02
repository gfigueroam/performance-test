import common from 'hmh-bfm-nodejs-common';

import mockIds from '../../test/common/helpers/ids';

import config from '../config';
import errors from '../models/errors';
import metrics from '../models/metrics';
import rest from '../utils/rest';


const labels = metrics.labels;

const idsGridApiHost = config.get('ids:api_host_name');

const Prometheus = common.metrics.client;
const idsRequestDuration = new Prometheus.Summary(
  'ids_request_duration_seconds',
  'IDS Request Duration',
  Object.keys(labels).concat(['type']),
);

const requestLabels = Object.assign(
  {},
  labels,
  { type: 'students' },
);

// Helper function to execute an API request with a safe failure result
//  Any successful 200 response from IDS should be access allowed
//  Any failed response thrown by HTTP library should be access denied
async function execAccessRequest(url) {
  try {
    const idsResponse = await rest.get.call(this, url);
    return idsResponse;
  } catch (error) {
    this.logger.warn(`IDS access request error! ${error}`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }
}

async function apiAccessRequest(url) {
  // Wrap the API call to the authorization endpoint to calculate duration
  const endRequestDuration = idsRequestDuration.startTimer(requestLabels);

  const result = await execAccessRequest.call(this, url);

  endRequestDuration();

  return result;
}

async function hasAccessTo(requestor, owner) {
  if (requestor === owner) {
    return true;
  }

  if (this.auth.useStubAuth) {
    // Check the auth ctx for a known HMH header that tells UDS
    //  to use stubbed IDS data instead of live external requests
    // For those cases, use mock IDS check with hard coded user ids
    this.logger.warn('WARN: IDS access request is being bypassed from BVT header');
    return mockIds.hasAccessTo(requestor, owner);
  }

  this.logger.info(`IDS: Checking for teacher (${requestor}) / student (${owner}) relationship`);

  // IDS lookup checking whether `requestor` is teacher of `owner`
  // https://idm-ids-grid-api.br.hmheng.io/ids/v1/teachers/7c5a56ae-49f6-473f-83dc-090467b71995/students
  const url = `${idsGridApiHost}/ids/v1/teachers/${requestor}/students`;
  const students = await apiAccessRequest.call(this, url);

  return students.map(s => (s.refId)).includes(owner);
}

export default {
  hasAccessTo,
};
