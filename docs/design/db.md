UDS is backed by DynamoDB, a NoSQL datastore offered by AWS.

# Tables
DynamoDB has evolved their nomenclature over time. The following terms should be considered synonymous:
* Hash Key and Partition Key
* Range Key and Sort Key

## Fields
_key_ on its own refers to the UDS API parameter _key_ and should not be confused with either term.
_user_ is the user ID.
_app name_ is the name of the HMH application.

For simplicity, other field names not used as a hash key or range key are not shown.

## CalculatedBehavior (UDS API: data.cb.\*)
<pre>
<b>Table Name</b>: calculatedBehavior
<b>Hash Key</b>: user
<b>Range Key</b>: key
<b>Global Secondary Index</b>: none
</pre>

## Created Content (UDS API: data.user.\*)
Data will be stored in Application Data tables, using the reserved app name _hmh_.

## Application Data (UDS API: data.app.\*)
<pre>
<b>Table Name</b>: apps
<b>Hash Key</b>: app name
<b>Range Key</b>: none
<b>Global Secondary Index</b>: none

<b>Table Name</b>: appDataJson
<b>Hash Key</b>: app name + user
<b>Range Key</b>: key
<b>Global Secondary Index</b>:
  <b>GSI Hash Key</b>: user
  <b>GSI Range Key</b>: app name + key

<b>Table Name</b>: appDataBlob
<b>Hash Key</b>: app name + user
<b>Range Key</b>: key
<b>Global Secondary Index</b>:
  <b>GSI Hash Key</b>: user
  <b>GSI Range Key</b>: app name + key
</pre>

# Operations
In this section we will discuss an overview of how to use DynamoDB and the above tables to solve some problems with non-obvious solutions that the API must be able to support.

### Query for user quota within a given app
Two DynamoDB Query operations (one for `appDataJson` and one for `appDataBlob`) for hash key `app name` + `user` across all range keys. This operation returns up to 1MB of data and can be paginated if quotas over 1MB are desired.

### Get list of all users storing data for a given app (UDS API: `data.admin.users`)
Two DynamoDB Query operations (one for `appDataJson` and one for `appDataBlob`) for hash key `begins_with` `app name` across all users and all range keys. This operation is paginated. Projection should omit all non-key fields.

### Get list of all apps storing data for a given user (UDS API: `data.admin.apps`)
Two DynamoDB BatchGetItem operations (one for `appDataJson` and one for `appDataBlob`) on the Global Secondary Index for hash key `user` across all range keys. This operation is paginated. Projection should omit all non-key fields.

# Quota
Quota can be queried for every write as this is a single operation (albeit potentially a large payload is returned). Barring that, quota can be stored and tracked either outside of DynamoDB via a cache or within DynamoDB as its own table. In both cases consistency can be periodically enforced by computing the user's actual quota consumption.

# Observations
In a relational data store, the primary key for application data tables would consist of three columns: `app name`, `user`, and `key`, with additional indexes on `app name` and `user` individually. In DynamoDB, `app name`, `key`, and `app name` + `key` cannot be used as a Hash Key on any table or Global Secondary Index due to the possibility of hot spotting, or clustering heavily used applications or keys on a single partition and browning out DynamoDB availability.
