package com.hmhco.assignments.performance.simulations

import com.hmhco.assignments.performance.config.Config
import com.hmhco.assignments.performance.utils.SimulationTraits
import com.hmhco.assignments.performance.config.Config._
import com.hmhco.assignments.performance.scenarios.{DataUserSet, LoginScenario}
import io.gatling.core.Predef._
import io.gatling.http.Predef.http
import io.gatling.http.protocol.HttpProtocolBuilder

class BaseSimulation extends Simulation with SimulationTraits {

  logger.info(s"Ramp up (sec)             : - ${RAMP_UP_SEC}")
  logger.info(s"Number of users           : - ${NUMBER_OF_USERS}")
  logger.info(s"Duration of test (sec)    : - ${EXECUTION_TIME_SEC}")
  logger.info(s"Maximum duration of test (sec): - ${MAX_DURATION_SEC}")
  logger.info(s"Maximum duration of test (sec): - ${MAX_DURATION_SEC}")
  logger.info(s"Debug: - ${DEBUG}")

  val httpProtocol: HttpProtocolBuilder = http
    .baseUrl(Config.BASE_URL)
    .headers(Config.commonHeader)

  val teacherFeeders = csv("teachers.csv").random

  val getTeacherAssignments = scenario("DataUserSet").feed(teacherFeeders)
    .during(EXECUTION_TIME_SEC) {
      exec(LoginScenario.scenario)
        .exec(DataUserSet.scenario)
        .pause(THINK_TIME_SEC)
    }

  var testSetup = setUp(getTeacherAssignments.inject(atOnceUsers(1))).maxDuration(MAX_DURATION_SEC)

  testSetup.protocols(httpProtocol)

}

