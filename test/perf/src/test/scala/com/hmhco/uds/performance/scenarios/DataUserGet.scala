
package com.hmhco.uds.performance.scenarios

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.core.body.StringBody
import scala.collection.mutable.Map
import com.hmhco.uds.performance.utils.Utils._
//import scala.util.Random

case object DataUserGet extends BaseScenario {
  val description: String = "data.user.get"
  val method: String = "api/v1/data.user.get"

  def scenario = exec(
    exec{
      session =>
        val key = session("documentKey").as[String]
        val rmap = Map[String,String](
          "$DOCKEY$" -> key
        )
        val tmpQuery = loadJSON("data.user.get",rmap)
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
