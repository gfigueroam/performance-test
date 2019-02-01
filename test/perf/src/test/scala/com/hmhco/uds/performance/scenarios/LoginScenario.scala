
package com.hmhco.uds.performance.scenarios

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.core.body.StringBody
import com.hmhco.uds.performance.config.Config._

case object LoginScenario extends BaseScenario {
  val description: String = "login"
  val method: String = ""

  def scenario = exec(
    exec { session =>
      val username = session("username").as[String]
      val password = session("password").as[String]
      val tenantPid = session("connection").as[String]
      logger.debug(s"Logging In with user: ${username}/${password}")

      val bodystr = s"""{
        "username": "${username}",
        "password": "${password}",
        "tenantPid": "${tenantPid}"
      }"""

      val url = authenticationUrls(BASE_ENV)
      logger.debug(s"body String: ${bodystr}/${url}")
      session.set("bodystr" , s"${bodystr}")
    }.exec (
      http("login")
        .post(authenticationUrls(BASE_ENV))
        .headers(cTypeHeaderMap)
        .body(StringBody("${bodystr}"))
        .check(
          status.is(200),
          jsonPath("$.sifToken").ofType[String].saveAs("token")
        )
    )
  )
}
