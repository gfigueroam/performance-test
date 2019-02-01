
package com.hmhco.uds.performance.scenarios

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.core.body.StringBody
import scala.collection.mutable.Map
import com.hmhco.uds.performance.utils.Utils._
//import scala.util.Random

case object DataUserSet extends BaseScenario {
  val description: String = "data.user.set"
  val method: String = "api/v1/data.user.set"

  def scenario = exec(
    exec{
      session =>
        val key = java.util.UUID.randomUUID.toString()
        val rmap = Map[String,String](
          "$DOCKEY$" -> key
        )
        val tmpQuery = loadJSON("data.user.set",rmap)
        session.set("requestBody" ,tmpQuery ).set("documentKey",  key)
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
