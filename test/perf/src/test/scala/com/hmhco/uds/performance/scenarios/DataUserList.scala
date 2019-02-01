
package com.hmhco.uds.performance.scenarios

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.core.body.StringBody
import scala.collection.mutable.Map
import com.hmhco.uds.performance.utils.Utils._
//import scala.util.Random

case object DataUserList extends BaseScenario {
  val description: String = "data.user.list"
  val method: String = "api/v1/data.user.list"

  def scenario = exec(
    exec{
      session =>
        val rmap = Map[String,String]()
        val tmpQuery = loadJSON("data.user.list",rmap)
        session.set("requestBody" ,tmpQuery )
    }
   .exec {
      httpRequest
        .body(StringBody("${requestBody}"))
        .check(
          status.is(200),
          bodyBytes.exists
        )
    }
  )
}
