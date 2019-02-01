
package com.hmhco.uds.performance.scenarios

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.core.body.StringBody
import scala.collection.mutable.Map
import com.hmhco.uds.performance.utils.Utils._
import scala.util.Random

case object DataAppSet extends BaseScenario {
  val description: String = "data.app.set"
  val method: String = "api/v1/data.app.set"

  def scenario = exec(
    exec{
      session =>
         val cbKey = Random.shuffle(cbKeys.toList).head.toString()
         val uniqueKey = cbKey + "-" + java.util.UUID.randomUUID.toString()
         val appName = Random.shuffle(appNames.toList).head.toString()
         val rmap = Map[String,String](
          "$UNIQKEY$" -> uniqueKey,
          "$APPNAME$" -> appName
        )
         val tmpQuery = loadJSON("data.app.set",rmap)
         session.set("requestBody" ,tmpQuery ).set("AppDataKey" ,uniqueKey ).set("AppDataName" ,appName )
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
