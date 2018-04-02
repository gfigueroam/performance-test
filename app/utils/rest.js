import common from 'hmh-bfm-nodejs-common';

import querystring from 'querystring';


async function get(url, params, transform) {
  const uri = params ? `${url}?${querystring.stringify(params)}` : url;

  this.logger.info(`HTTP library making request: ${uri}`);

  const options = {
    encoding: 'utf8',
    followRedirect: false,
    headers: {
      Authorization: this.auth.token,
    },
    json: true,
    transform,
  };

  const response = await common.utils.rest.get.apply(this, [uri, options]);
  return response;
}

export default {
  get,
};
