package com.hmhco.uds.performance.scenarios

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.core.body.StringBody


case object UserDataGetScenario extends BaseUserDataScenario {

  val description: String = "UDS data.user.get"
  val method: String = "api/v1/data.user.get"

  val body: StringBody =
    StringBody(s"""{
      "key": "${key}",
      "requestor": "${targetId}"
    }""")


  def scenario = exec(
    setupToken.exec {
      httpRequest
        .body(body)
        .check(
          status.is(200),
          jsonPath("$.ok").ofType[Boolean].is(true),
          jsonPath("$.result.data").ofType[String].is(value),
          jsonPath("$.result.key").ofType[String].is(key),
          jsonPath("$.result.type").ofType[String].is("text")
        )
    }
  )

}
