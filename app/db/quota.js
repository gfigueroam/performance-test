import sizeof from 'object-sizeof';
import errors from '../models/errors';

import dynamodbClient from './dynamoDBClient';
import utils from './utils';

import nconf from '../config';
import constants from '../utils/constants';
import auth from '../auth';


async function getConsumedQuota(params) {
  // Validate required params and updates owner/requestor value
  utils.validateParams(params, ['app', 'requestor']);
  utils.ensureOwnerParam(params);

  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`Quota DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  let lastEvaluatedKey;
  let consumed = 0;
  do {
    const queryParams = {
      ConsistentRead: this.database && this.database.consistentRead,
      ExpressionAttributeNames: {
        '#appUser': 'appUser',
      },
      ExpressionAttributeValues: {
        ':appUser': `${params.app}${constants.DELIMITER}${params.owner}`,
      },
      KeyConditionExpression: '#appUser = :appUser',
      ReturnConsumedCapacity: 'TOTAL',
      Select: 'ALL_ATTRIBUTES', // Return full items
      TableName: nconf.get('database').appDataJsonTableName,
    };
    if (lastEvaluatedKey) {
      queryParams.ExclusiveStartKey = lastEvaluatedKey;
    }

    // eslint-disable-next-line no-await-in-loop
    const iterationResult = await dynamodbClient.instrumented('query', queryParams);

    consumed += sizeof(iterationResult.Items);
    lastEvaluatedKey = iterationResult.LastEvaluatedKey;

    // Note: If we passed the quota to this method, we could optimize by not iterating
    // once consumed >= quota, and instead returning false. However, since we currently
    // enforce that quota is < 1024 KB, DynamoDB's return limit is 1 MB so we expect to
    // never iterate anyway so that optimization is not necessary.
  } while (lastEvaluatedKey !== undefined);

  return consumed;
}

module.exports = {
  getConsumedQuota,
};
