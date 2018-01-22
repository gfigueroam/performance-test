import sizeof from 'object-sizeof';

import nconf from '../config';
import dynamodbClient from './dynamoDBClient';
import constants from '../utils/constants';

async function getConsumedQuota(params) {
  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }
  if (!params.app) {
    throw new Error('Parameter "app" is required.');
  }

  let lastEvaluatedKey;
  let consumed = 0;
  do {
    const queryParams = {
      ExpressionAttributeNames: {
        '#appUser': 'appUser',
      },
      ExpressionAttributeValues: {
        ':appUser': `${params.app}${constants.DELIMITER}${params.user}`,
      },
      KeyConditionExpression: '#appUser = :appUser',
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
