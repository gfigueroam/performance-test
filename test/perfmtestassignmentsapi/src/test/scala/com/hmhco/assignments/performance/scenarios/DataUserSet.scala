
package com.hmhco.assignments.performance.scenarios

import io.gatling.core.Predef._
import io.gatling.http.Predef.{http, status}
import io.gatling.http.Predef._


case object DataUserSet {

  val description: String = "get teacher assignments"
  val method: String = "/v2/teacherAssignments"

  def scenario = exec(http(description)
    .get(method)
    .header("authorization",session =>
      session("token").as[String]
    )
    .check(status.is(200)))
}
