package com.hmhco.assignments.performance.config

import com.typesafe.scalalogging.StrictLogging
import io.gatling.http.Predef._

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


  private val authenticationUrls = Map[String, String](
    ENV_LOCAL -> "https://idm-ids-grid-api.br.hmheng.io/ids/v1/sus/login",
    ENV_INT -> "https://idm-ids-grid-api.br.hmheng.io/ids/v1/sus/login",
    ENV_CERT -> "https://idm-ids-grid-api.br.hmheng.io/ids/v1/sus/login"
  )

  // Set of known external assignment service URLs by environment
  //TODO - Change the external urls once CORS has been configured in assignments service
  private val assignmentServiceUrls = Map[String, String](
    ENV_LOCAL -> "http://localhost:8080",
    ENV_INT -> "http://int.hmhone.app.hmhco.com/api/assignment",
    ENV_CERT -> "https://cert.hmhone.app.hmhco.com/api/assignment"
  )


  val BASE_URL = assignmentServiceUrls.get(BASE_ENV).get
  val AUTHENTICATION_URL = authenticationUrls.get(BASE_ENV).get

  // Define all the headers required for requests to Planner
  // Local requests should include a header to skip IDS lookups
  //  Local is mostly used for debugging and is less representative
  val commonHeader = Map(
    HttpHeaderNames.ContentType -> "application/json;charset=UTF-8",
    HttpHeaderNames.Accept -> "application/json",
    HttpHeaderNames.Connection -> "keep-alive",
    HttpHeaderNames.Pragma -> "no-cache",
    HttpHeaderNames.AcceptEncoding-> "en-GB,en,q=0.8,en-US;q=0.6"//,

    //HttpHeaderNames.Authorization ->"${token}"
  )

}
