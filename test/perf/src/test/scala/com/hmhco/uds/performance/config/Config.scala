package com.hmhco.uds.performance.config

import io.gatling.core.body.StringBody
import io.gatling.core.Predef._
import io.gatling.core.structure.ChainBuilder
import io.gatling.http.Predef._


object Config {

  val ENV_LOCAL: String = "local"
  val ENV_CERT: String = "cert"

  // Set of known external UDS service URLs by environment
  val environmentUrls = Map[String, String](
    ENV_LOCAL -> "http://localhost:5200",
    ENV_CERT -> "https://api.cert.eng.hmhco.com/uds"
  )

  // Set of known user IDs for making requests
  val targetIds = Map[String, String](
    ENV_LOCAL -> "9bba9b76-39af-4dbb-87cd-eb04dcde1891",
    ENV_CERT -> "0ccd447d-d7a0-4648-848f-387fb25293e4"
  )

  def setupTokenActions = Map[String, ChainBuilder](
    // Local environment can just seed the session with a known service token
    ENV_LOCAL -> exec {
      session =>
        session
          .set("token", "SIF_HMACSHA256 SE1IX0RNUFM6emFsZXVvbXdaNHp2OG1EaEY1M0JEMUNrMWFDQ0tCLzdCQlJoNENjMzVYZz0K")
    },
    // Cert environment should make a full login request to get a user token
    ENV_CERT -> exec {
      val body = StringBody(s"""{
        "username": "QATeacher1_92004181_cert",
        "password": "E!1p0v9zf63z",
        "tenantPid": "92004180"
      }""")
      val url = "https://idm-ids-grid-api.cert.br.hmheng.io/ids/v1/sus/login"

      http("UDS User Login")
        .post(url)
        .headers(cTypeHeaderMap)
        .body(body)
        .check(
          status.is(200),
          jsonPath("$.sifToken").ofType[String].saveAs("token")
        )
    }
  )


  // Define all the headers required for requests to UDS
  // Local requests should include a header to skip IDS lookups
  //  Local is mostly used for debugging and is less representative
  private val commonHeader = List(
    HttpHeaderNames.ContentType -> "application/json"
  )
  private val certHeaders = commonHeader ++ List(
    HttpHeaderNames.Authorization -> "${token}"
  )
  private val localHeaders = List("x-hmh-uds-bvt" -> "gatling")

  private val allHeaderMap = Map(
    ENV_LOCAL -> (certHeaders ++ localHeaders).toMap,
    ENV_CERT -> certHeaders.toMap
  )

  private val cTypeHeaderMap = commonHeader.toMap

  // Define the set of headers required for each request
  def headerMap(env: String): Map[String, String] = allHeaderMap(env)
}
