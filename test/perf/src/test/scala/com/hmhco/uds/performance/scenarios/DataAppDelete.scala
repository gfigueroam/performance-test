
package com.hmhco.uds.performance.scenarios

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.core.body.StringBody
import scala.collection.mutable.Map
import com.hmhco.uds.performance.utils.Utils._
import scala.util.Random

case object DataAppDelete extends BaseScenario {
  val description: String = "data.app.delete"
  val method: String = "api/v1/data.app.delete"

  def scenario = exec(
    exec{
      session =>
        val appkey = session("AppDataKey").as[String]
        val appName = session("AppDataName").as[String]

        val rmap = Map[String,String](
          "$UNIQKEY$" -> appkey,
          "$APPNAME$" -> appName
        )
        val tmpQuery = loadJSON("data.app.get",rmap)
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
