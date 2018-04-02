import common from 'hmh-bfm-nodejs-common';

import errors from '../models/errors';

// Pass in the entire UDS list of known errors so that the
//  exception handler can check an error code against this list
const onException = common.utils.swatch.handler(errors);

export default onException;
