#!/bin/bash

ENV=$NODE_ENV

echo Executing UDS performance tests on [$ENV] environment.

pushd test/perf

echo Running Gatling simulation to query and set values
SBT_OPTS="-Denv=$ENV -Dusers=10" sbt gatling:test

RESULT=$?

popd

if [ $RESULT -ne 0 ]
then
  echo "Error running performance tests. Exiting!" >&2
  exit 1
else
  echo "Performance tests succeeded." >&2
fi
