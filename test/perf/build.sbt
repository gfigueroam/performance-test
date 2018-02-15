name := "uds"

organization := "com.hmhco.uds"

version := "1.0.0-SNAPSHOT"

scalaVersion := "2.12.2"

// Requires external Gatling dependencies + HMH quality team base package
libraryDependencies ++= Seq(
  "io.gatling"                  % "gatling-test-framework"      % "2.3.0"   % "test,it",
  "io.gatling.highcharts"       % "gatling-charts-highcharts"   % "2.3.0"   % "test,it",
  "com.hmhco.quality"           % "performance-base"            % "0.1.0"   % "test"
)

scalacOptions ++= Seq(
  "-unchecked",
  "-deprecation",
  "-Xlint",
  "-Yrangepos",
  "-Ywarn-dead-code",
  "-language:_",
  "-target:jvm-1.8",
  "-encoding", "UTF-8"
)

// Enable Gatling plugin to support Gatling package functionality
enablePlugins(GatlingPlugin)

// Add HMH Artifactory to pull internally-published com.hmhco.quality package
resolvers += "Artifactory" at "https://repo.br.hmheng.io/artifactory/libs-release-local"
