FROM docker.br.hmheng.io/com-hmhco-one-ui/nodebase:9e5e532afafab5e7335b02a491ec2cd3e03565cf
MAINTAINER Brian Timm brian.timm@hmhco.com
LABEL app=docker.br.hmheng.io/com-hmhco-uds/uds

ENV SCALA_VERSION 2.12.2
ENV SBT_VERSION 0.13.15

# Update and install latest telegraf package
RUN wget https://dl.influxdata.com/telegraf/releases/telegraf_1.4.4-1_amd64.deb
RUN dpkg -i telegraf_1.4.4-1_amd64.deb

# Install OpenJDK 8 required for Scala and sbt
RUN sudo apt-get update
RUN sudo apt-get install -y software-properties-common python-software-properties
RUN sudo add-apt-repository ppa:openjdk-r/ppa
RUN sudo apt-get update
RUN sudo apt-get install -y openjdk-8-jdk

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

# Copy all UDS resources into working directory
ADD app_deploy/ /opt/uds

# Set up working directory to start UDS service
WORKDIR /opt/uds
