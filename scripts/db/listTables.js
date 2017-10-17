var AWS = require('aws-sdk');

var env = process.env.NODE_ENV || 'local';

// Load config based on the current environment
var configFilename = '../../database/config/db.' + env + '.json';
var config = require(configFilename);

// Configure the AWS package and initialize DB handle
var awsConfigFilename = './database/config/db.' + env + '.json';
AWS.config.loadFromPath(awsConfigFilename);

var db = new AWS.DynamoDB({
  region: 'us-east-1',
  apiVersion: '2012-10-08',
  endpoint: new AWS.Endpoint(config.endpoint)
});

// Call DynamoDB to list all tables in local instance
db.listTables({}, function(err, data) {
  if (err) {
    console.log("Error", err.code);
  } else {
    console.log("Table names are ", data.TableNames);
  }
});
