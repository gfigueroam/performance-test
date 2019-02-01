
package com.hmhco.uds.performance.scenarios

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.core.body.StringBody
import scala.collection.mutable.Map
import com.hmhco.uds.performance.utils.Utils._
import scala.util.Random


case object DataCbDecrement extends BaseScenario {
  val description: String = "data.cb.decrement"
  val method: String = "api/v1/data.cb.decrement"

  def scenario = exec(
    exec{
      session =>
        val cbKey = Random.shuffle(cbKeys.toList).head.toString()
        val rmap = Map[String,String](
          "$CBKEY$" -> cbKey
        )

        val tmpQuery = loadJSON("data.cb.decrement",rmap)
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
