import Prometheus from 'prom-client';

import config from '../config';
import errors from '../models/errors';
import labels from '../metrics/labels';
import rest from '../utils/rest';

const idsGridApiHost = config.get('ids:api_host_name');

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
  if (this.auth.useStubAuth) {
    // Check the auth ctx for a known HMH header that tells UDS
    //  to use stubbed IDS data instead of live external requests
    // For those cases, we assume the access request is allowed
    this.logger.warn('WARN: IDS access request is being bypassed from BVT header');
    return true;
  }

  if (requestor === owner) {
    return true;
  }

  // IDS lookup checking whether `requestor` is teacher of `owner`
  // https://idm-ids-grid-api.br.hmheng.io/ids/v1/teachers/7c5a56ae-49f6-473f-83dc-090467b71995/students
  const url = `${idsGridApiHost}/ids/v1/teachers/${requestor}/students`;
  const students = await apiAccessRequest.call(this, url);

  return students.map(s => (s.refId)).includes(owner);
}

export default {
  hasAccessTo,
};
