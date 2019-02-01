FROM docker.br.hmheng.io/quality/gatling_maven_telegraf:gatling_2.3.0_maven_3.5.2_telegraf_1_4_4


RUN adduser --disabled-password --gecos "" --uid 5018 hmheng-planner-api
RUN adduser --disabled-password --gecos "" --uid 5019 hmheng-uds


# Copy your gatling source to /usr/local/maven_project/
COPY test /usr/local/maven_project/test
COPY test/perf/pom.xml /usr/local/maven_project/pom.xml

# VOLUME /usr/local/maven_project

# Entrypoint is already defined in gatling_maven_telegraf:gatling_2.3.0_maven_3.5.2_telegraf_1_4_4
# ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Example usage.. n.b. mount telegraf.conf file like below to point telegraf
# docker run -i -v $PWD/telegraf.conf:/etc/telegraf/telegraf.conf:ro testgatlingtelegrafed:1.0 mvn -f /usr/local/maven_project/pom.xml clean gatling:execute -Dgatling.simulationClass=com.hmhco.quality.ed.simulations.EdSimulation -Denv=int -Dgatling.noReports=true -Dgatling.failOnError=false -DrampUp=1 -DmaxDuration=4 -DnumberOfUsersMax=1 -DexecutionTime=3 -DpauseNavigation=4 -DpauseRendering=2

# When running in bedrock via aurora file you will need to make telegraf.conf available but you wont be able to mount it. In that case
COPY test/perf/bedrock/telegraf/telegraf.conf /etc/telegraf/telegraf.conf
