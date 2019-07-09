package com.hmhco.assignments.performance.scenarios

import com.hmhco.assignments.performance.config.Config
import com.hmhco.assignments.performance.utils.{SimulationTraits, Utils}
import io.gatling.core.Predef._
import io.gatling.core.structure.ScenarioBuilder
import io.gatling.http.Predef._
import io.gatling.http.protocol.HttpProtocolBuilder

class GetTeacherAssignments extends Simulation with SimulationTraits {

  private val requestCount = 10

  private val endpoint = "/v4/teacherAssignments"
  private val endpoint_health = "/health"


  val utils = new Utils
  val userFeeders = createFeeder("teachers")

  val httpProtocol: HttpProtocolBuilder = http
    .baseUrl(Config.BASE_URL)
    .headers(Config.commonHeader)

  def sc: ScenarioBuilder = scenario("get")
    .feed(csv("teachers.csv").random)
    .exec(LoginScenario.scenario)
    .exec(http("get")
      .get(endpoint)
        .header("authorization",session =>
            session("token").as[String]
        )
      .check(status.is(200)))


  setUp(sc.inject(atOnceUsers(1)).protocols(httpProtocol))
}
