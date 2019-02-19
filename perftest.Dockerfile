FROM docker.br.hmheng.io/base-ubuntu:16.04
LABEL team "Bifrost Team bifrost-team@hmhco.com"
LABEL app "docker.br.hmheng.io/com-hmhco-uds/uds"

ENV SCALA_VERSION 2.12.2
ENV SBT_VERSION 0.13.15

# Install curl and OpenJDK 8 required for Scala and sbt
RUN \
  apt-get update && \
  apt-get install -y curl && \
  apt-get install -y software-properties-common python-software-properties && \
  add-apt-repository ppa:openjdk-r/ppa && \
  apt-get install -y openjdk-8-jdk

# Install Scala and sbt to run Gatling performance tests
RUN \
  curl -f -s -L http://downloads.typesafe.com/scala/$SCALA_VERSION/scala-$SCALA_VERSION.tgz | tar xfz - -C /root/ && \
  echo >> /root/.bashrc && \
  echo 'export PATH=~/scala-$SCALA_VERSION/bin:$PATH' >> /root/.bashrc

RUN \
  curl -L -o sbt-$SBT_VERSION.deb http://dl.bintray.com/sbt/debian/sbt-$SBT_VERSION.deb && \
  dpkg -i sbt-$SBT_VERSION.deb && \
  rm sbt-$SBT_VERSION.deb && \
  apt-get update && \
  apt-get install sbt && \
  sbt sbtVersion

# Create working directory in container for UDS
RUN mkdir -p /opt

RUN ls -l

# Copy all UDS resources into working directory
ADD test/ /opt/uds

# Set up working directory to start UDS service
WORKDIR /opt/uds
