
package com.hmhco.uds.performance.utils

import io.gatling.core.Predef._
import io.gatling.core.feeder.{RecordSeqFeederBuilder}
//import io.gatling.core.feeder.{FeederSupport, RecordSeqFeederBuilder}
import io.gatling.http.Predef._
import io.gatling.http.protocol.HttpProtocolBuilder
import com.typesafe.scalalogging.StrictLogging

trait SimulationTraits   extends StrictLogging {

  def getHttpConf(): HttpProtocolBuilder = {
    http
  }
  def createFeeder(filenamePrefix: String): RecordSeqFeederBuilder[String] = {
    csv(filenamePrefix + ".csv").records.circular
  }

  def createFeeder(filenamePrefix: String, usernamePrefix : String): RecordSeqFeederBuilder[String] = {
    csv(filenamePrefix + ".csv").records.filter(record => record("username").startsWith(usernamePrefix)).circular
  }

}
