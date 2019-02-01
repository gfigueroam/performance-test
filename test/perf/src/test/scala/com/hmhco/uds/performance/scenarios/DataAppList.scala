
package com.hmhco.uds.performance.scenarios

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.core.body.StringBody
import scala.collection.mutable.Map
import com.hmhco.uds.performance.utils.Utils._
import scala.util.Random

case object DataAppList extends BaseScenario {
  val description: String = "data.app.list"
  val method: String = "api/v1/data.app.list"

  def scenario = exec(
    exec{
      session =>
        val rmap = Map[String,String](
          "$APPNAME$" -> Random.shuffle(appNames.toList).head.toString()
        )
        val tmpQuery = loadJSON("data.app.list",rmap)
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
