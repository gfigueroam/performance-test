
package com.hmhco.assignments.performance.scenarios

import com.hmhco.assignments.performance.config.Config
import com.hmhco.assignments.performance.utils.{User, Utils}
import com.typesafe.scalalogging.StrictLogging
import io.gatling.core.Predef._
import io.gatling.core.body.StringBody
import io.gatling.http.Predef._

case object LoginScenario extends StrictLogging {
  val description: String = "login"
  val method: String = ""

  def scenario = exec(

    exec { session =>
      val username = session("username").as[String]
      val password = session("password").as[String]
      val tenantPid = session("tenantPid").as[String]
      logger.debug(s"Logging In with user: ${username}/${password}")

      val bodystr = s"""{
        "username": "${username}",
        "password": "${password}",
        "tenantPid": "${tenantPid}"
      }"""

      logger.debug(s"body String: ${bodystr}/${Config.AUTHENTICATION_URL}")
      session.set("bodystr" , s"${bodystr}")
    }.exec (
      http("login")
        .post(Config.AUTHENTICATION_URL)
        .body(StringBody("${bodystr}"))
        .check(
          status.is(200),
          jsonPath("$.sifToken").ofType[String].saveAs("token")
        )
    )
  )
}
