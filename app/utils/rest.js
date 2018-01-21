import querystring from 'querystring';
import request from 'request-promise';

async function get(url, params) {
  const uri = params ? `${url}?${querystring.stringify(params)}` : url;

  this.logger.info(`HTTP library making request: ${uri}`);

  const options = {
    headers: {
      Authorization: this.auth.token,
    },
  };

  try {
    const response = await request.get(uri, options);

    this.logger.info(`HTTP GET request complete: ${uri}`);

    return response;
  } catch (error) {
    this.logger.error(`HTTP GET request: ${uri}`);
    this.logger.error(`HTTP GET request error: ${error}`);

    throw error;
  }
}

export default {
  get,
};
