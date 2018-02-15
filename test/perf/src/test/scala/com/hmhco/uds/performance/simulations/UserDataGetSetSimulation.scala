package com.hmhco.uds.performance.simulations

import com.hmhco.uds.performance.scenarios.UserDataGetScenario
import com.hmhco.uds.performance.scenarios.UserDataSetScenario
import com.hmhco.quality.performance.config.Config

import io.gatling.core.Predef._
import io.gatling.http.Predef._

import scala.concurrent.duration._


class UserDataGetSetSimulation extends Simulation {

  val simulationName = "UserDataGetSet"

  // First execute a batch of set requests followed by get requests
  lazy val udsSimulation = scenario(simulationName).exec {
    repeat(Config.ITERATIONS) {
      exec(
        UserDataSetScenario.scenario
      )
      .exec(
        UserDataGetScenario.scenario
      )
    }
  }

  setUp(
    udsSimulation.inject(
      rampUsers(Config.NUM_USERS) over(Config.NUM_USERS seconds)
    )
  ).assertions(
    global.responseTime.mean.lt(500),
    global.successfulRequests.percent.is(100)
  ).protocols(http)
}
