package com.hmhco.uds.performance.config

//import io.gatling.core.body.StringBody
//import io.gatling.core.Predef._
//import io.gatling.core.structure.ChainBuilder
import io.gatling.http.Predef._
import com.typesafe.scalalogging.StrictLogging

object Config extends StrictLogging {

  val ENV_LOCAL: String = "local"
  val ENV_INT: String = "int"
  val ENV_CERT: String = "cert"
  val FEED_MAX_DOCUMENT_COUNT: Int = 10


  val BASE_ENV = System.getProperty("env","cert")

  val DEBUG = System.getProperty("debug","false")

  // ramp up (set in minutes, convert to sec) - 420s
  val RAMP_UP_SEC = System.getProperty("rampUp", "1").toInt * 60

  // Start (user count) - 100: most of the scenarios
  val NUMBER_OF_USERS = System.getProperty("numberOfUsersMax", "1").toInt

  val MAX_DURATION_SEC = System.getProperty("maxDuration", "1").toInt * 60

  // Duration (Minutes) - 3600
  val EXECUTION_TIME_SEC = System.getProperty("maxDuration", "1").toInt * 60

  // thinktime (seconds) - 10
  val THINK_TIME_SEC = System.getProperty("pauseNavigation", "5").toInt

  // Set of known external Planner service URLs by environment
  val authenticationUrls = Map[String, String](
    ENV_LOCAL -> "http://localhost:3001",
    ENV_INT -> "https://idm-ids-grid-api.int.br.hmheng.io/ids/v1/sus/login",
    ENV_CERT -> "https://idm-ids-grid-api.cert.br.hmheng.io/ids/v1/sus/login"
  )

  // Set of known external Planner service URLs by environment
  val environmentUrls = Map[String, String](
    ENV_LOCAL -> "http://localhost:3001",
    ENV_INT -> "https://api.int.eng.hmhco.com/uds",
    ENV_CERT -> "https://api.cert.eng.hmhco.com/uds"
  )

  // Define all the headers required for requests to Planner
  // Local requests should include a header to skip IDS lookups
  //  Local is mostly used for debugging and is less representative
  val commonHeader = List(
    HttpHeaderNames.ContentType -> "application/json"
  )
  val certHeaders = commonHeader ++ List(
    HttpHeaderNames.Authorization -> "${token}"
    //HttpHeaderNames.Authorization -> "token"
  )
  val localHeaders = List("x-hmh-planner-bvt" -> "gatling")

  val allHeaderMap = Map(
    ENV_LOCAL -> (certHeaders ++ localHeaders).toMap,
    ENV_INT -> (certHeaders ++ localHeaders).toMap,
    ENV_CERT -> certHeaders.toMap
  )

  val cTypeHeaderMap = commonHeader.toMap

  // Define the set of headers required for each request
  def headerMap(env: String): Map[String, String] = allHeaderMap(env)


}
