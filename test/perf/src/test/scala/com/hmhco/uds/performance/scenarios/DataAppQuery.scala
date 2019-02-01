
package com.hmhco.uds.performance.scenarios

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.core.body.StringBody
import scala.collection.mutable.Map
import com.hmhco.uds.performance.utils.Utils._
import scala.util.Random

case object DataAppQuery extends BaseScenario {
  val description: String = "data.app.query"
  val method: String = "api/v1/data.app.query"

  def scenario = exec(
    exec{
      session =>
        val cbKey = Random.shuffle(cbKeys.toList).head.toString()
        val rmap = Map[String,String](
          "$UNIQKEY$" -> cbKey,
          "$APPNAME$" -> Random.shuffle(appNames.toList).head.toString()
        )
        val tmpQuery = loadJSON("data.app.query",rmap)
        session.set("requestBody" ,tmpQuery )
    }
   .exec {
      httpRequest
        .body(StringBody("${requestBody}"))
        .check(
          status.is(200),
          bodyBytes.exists,
          jsonPath("$.result..[?(@.type=='Level')].attributes.number").transformOption(x => x.orElse(Some("1"))).saveAs("user_level")
        )
    }
  )
}
