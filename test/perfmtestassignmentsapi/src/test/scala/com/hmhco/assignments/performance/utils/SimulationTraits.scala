
package com.hmhco.assignments.performance.utils

import io.gatling.core.Predef._
import io.gatling.core.feeder.{Feeder, FeederBuilder, Record, SourceFeederBuilder}
//import io.gatling.core.feeder.{FeederSupport, RecordSeqFeederBuilder}
import com.typesafe.scalalogging.StrictLogging
import io.gatling.http.Predef._
import io.gatling.http.protocol.HttpProtocolBuilder

trait SimulationTraits extends StrictLogging {

  def getHttpConf(): HttpProtocolBuilder = {
    http
  }
//  def createFeeder(filename: String):SourceFeederBuilder[String]  = {
//
//    val records: SourceFeederBuilder[String] = csv("teachers.csv").batch
//    records
//
//  }
  /*def createFeeder(filename: String):Array[Map[String,Any]]  = {
    val utils = new Utils
    var records: Seq[Map[String, Any]] = csv("teachers.csv").readRecords

    var array: Array[Map[String,String]] = new Array[Map[String, String]](records.size)
  var map: Map[String, String] =  scala.collection.mutable.Map()
    records.foreach( r => r + ("token" ->
       utils.getAuthToken(
      r.get("username").get.toString,
      r.get("password").get.toString,
      r.get("tenantPid").get.toString)))
    logger.info(s"Logging In with user: $records")
    records.toArray
  }*/

  def createFeeder(filename: String):Array[Map[String,String]] = {

    val utils = new Utils
    var records: Seq[Map[String, Any]] = csv("teachers.csv").readRecords

    var array: Array[Map[String,String]] = new Array[Map[String, String]](records.size)

    var map: Map[String, String] = Map()
    records.foreach (r => array :+ Map("token" ->
      utils.getAuthToken(
        r.get("username").get.toString,
        r.get("password").get.toString,
        r.get("tenantPid").get.toString))
      )

    array
  }



  val customFeeder = new Feeder[String] {

    private val records = csv("teachers.csv").readRecords
    private val utils = new Utils

    var array: Array[Map[String,String]] = new Array[Map[String, String]](records.size)
    private var map: Map[String, String] = Map()
    records.foreach (r => map +=  "token" ->
      utils.getAuthToken(
        r.get("username").get.toString,
        r.get("password").get.toString,
        r.get("tenantPid").get.toString))

    // always return true as this feeder can be polled infinitivgitely
    override def hasNext = true

    override def next: Map[String, String] = {
      map
    }
  }

  /*def createFeeder(filenamePrefix: String, usernamePrefix : String): RecordSeqFeederBuilder[String] = {
    csv(filenamePrefix + ".csv").records.filter(record => record("username").startsWith(usernamePrefix)).circular
  }*/

}
