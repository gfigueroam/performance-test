#!/bin/bash

ENV=$NODE_ENV

echo Executing UDS performance tests on [$ENV] environment.

echo Cleaning Old results
rm -fR test/perf/target/gatling

pushd test/perf

echo Running Gatling simulation to query and set values
SBT_OPTS="-Denv=$ENV -DmaxDuration=10 -DrampUp=1 -DnumberOfUsersMax=10" sbt gatling:test

RESULT=$?

popd
pushd test/perf/target/gatling/basic*

filename='simulation.log'
echo Start
cat simulation.log | grep  'REQUEST' | awk -F'\t' '{print $3 , $8}' > tmp.txt

eCollection1=( $(cut -d ' ' -f1 tmp.txt ) )
eCollection2=( $(cut -d ' ' -f2 tmp.txt ) )

echo Removing Temporary file
rm tmp.txt

index=0
OK_COUNT=0
KO_COUNT=0

for i in "${eCollection2[@]}"
do
   index=$(expr $index + 1)
   httpcode=${eCollection2[index]}

   if [ "$httpcode" == "KO" ]; then
    KO_COUNT=$(expr $KO_COUNT + ${eCollection1[index]})
  elif [ "$httpcode" == "OK" ]; then
    OK_COUNT=$(expr $OK_COUNT + ${eCollection1[index]})
  fi
done

TOTAL=$(expr $KO_COUNT + $OK_COUNT)
percent=$((100*$KO_COUNT/$TOTAL))

popd

if [ $RESULT -ne 0  ] || [ $percent -gt  2 ]
then
  echo "Percentage Failures $percent "
  echo "Error running performance tests. Exiting!" >&2
  exit 1
else
  echo "Performance tests succeeded." >&2
fi