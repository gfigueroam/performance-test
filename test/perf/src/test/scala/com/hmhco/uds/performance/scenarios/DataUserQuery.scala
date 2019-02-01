
package com.hmhco.uds.performance.scenarios

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.core.body.StringBody
import scala.collection.mutable.Map
import com.hmhco.uds.performance.utils.Utils._

case object DataUserQuery extends BaseScenario {
  val description: String = "data.user.query"
  val method: String = "api/v1/data.user.query"

  def scenario = exec(
    exec{
      session =>
        val rmap = Map[String,String]()
        val tmpQuery = loadJSON("data.user.query",rmap)
        session.set("requestBody" ,tmpQuery )
    }
   .exec {
      httpRequest
        .body(StringBody("${requestBody}"))
        .check(
          status.is(200),
          bodyBytes.exists,
          jsonPath("$.result[*]").count.saveAs("documentCount")
        )
    }
  )
}
