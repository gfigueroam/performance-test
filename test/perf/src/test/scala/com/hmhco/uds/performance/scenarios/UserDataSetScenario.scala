package com.hmhco.uds.performance.scenarios

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.core.body.StringBody


case object UserDataSetScenario extends BaseUserDataScenario {

  val description: String = "UDS data.user.set"
  val method: String = "api/v1/data.user.set"

  val body: StringBody =
    StringBody(s"""{
      "key": "${key}",
      "type": "text",
      "data": "${value}",
      "requestor": "${targetId}"
    }""")


  def scenario = exec(
    setupToken.exec {
      httpRequest
        .body(body)
        .check(
          status.is(200),
          jsonPath("$.ok").ofType[Boolean].is(true)
        )
    }
  )

}
