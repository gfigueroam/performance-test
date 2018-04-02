User-Centric Data Service (UDS)

# Operations

* [Kibana production logs](https://kibana.br.hmheng.io/app/kibana#/discover/AWF8j2WRMmY0_W5X0fH3)

* [Grafana metrics dashboard](http://grafana.prod.hmheng-infra.brnp.internal/dashboard/db/uds)

* [Production Jenkins pipeline](http://jenkins.prod.hmheng-uds.brnp.internal/job/uds/)

* [#UDS on Slack](https://hmhco.slack.com/messages/C6MP6P7NE)

# Development Information

## Database
UDS uses DynamoDB as its data store. See [the DB design documentation](./docs/design/db.md) for more details.

## Coding Style

This project follows the [AirBnB Javascript Coding Guidelines](https://github.com/airbnb/javascript) using [ESLint](http://eslint.org/) settings.

## Local DynamoDB
1. Install the awsclient command line tool.
2. Run Local DynamoDB in Docker: `$ docker run -p 5201:5201 -d -v dynamodb_data:/opt/dynamodb/data -v dynamodb_workdir:/opt/dynamodb/workdir docker.br.hmheng.io/com-hmhco-uds/dynamodb` (If for some reason a DynamoDB image has not been built, you can build one yourself by running `$ ./deploy/dynamo/docker.sh`. You'll need to be on the Bedrock VPN.)
3. Create necessary tables by running `$ npm run db:create:local`. (In dev, int, cert, and prod environments this is already done by TerraForm.)
4. Verify the tables were created:  `$ aws dynamodb list-tables --region us-east-1 --endpoint-url http://localhost:5201`. (Note that the `region` specified in the command must match the region in the database configuration.)

To scan the items stored in the DynamoDB table: `$ aws dynamodb scan --table-name uds-local-calculated-behavior --region us-east-1 --endpoint-url http://localhost:5201`

### Convenience Scripts

* List All Tables `$ npm run db:list:local`
* Delete Tables `$ npm run db:delete:local`
* Create Tables `$ npm run db:create:local`
* Scan Tables (List Contents) `$ npm run db:scan:local`

### Commandline Access
Query for a single app:
* `$ aws dynamodb get-item --endpoint http://localhost:5201 --region us-east-1 --table-name uds-local-apps --key '{"name": {"S": "APP2"}}'`

### Telegraf

UDS instances running in Bedrock include [Telegraf](https://www.influxdata.com/time-series-platform/telegraf/)
to scrape Prometheus metrics and push them to HMH shared InfluxDB. Telegraf service does not need to run locally,
but is spun up in the Aurora configuration and run embedded in each UDS instance, tagging metrics in InfluxDB
with links to each separate Mesos instance/shard. The latest UDS metrics dashboard is available on
[Grafana](http://grafana.prod.hmheng-infra.brnp.internal/dashboard/db/uds).
