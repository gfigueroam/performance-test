
package com.hmhco.uds.performance.simulations

import com.hmhco.uds.performance.scenarios._
import com.hmhco.uds.performance.utils.Utils._
import com.hmhco.uds.performance.config.Config._
import com.hmhco.uds.performance.config.Workload._
import com.hmhco.uds.performance.utils.SimulationTraits
import io.gatling.core.Predef._


class BasicSimulation extends Simulation with SimulationTraits {

  //logger.info(s"Launching a test run against environment ${TARGET_ENV}")
  logger.info(s"Ramp up (sec)             : - ${RAMP_UP_SEC}")
  logger.info(s"Number of users           : - ${NUMBER_OF_USERS}")
  logger.info(s"Duration of test (sec)    : - ${EXECUTION_TIME_SEC}")
  logger.info(s"Maximum duration of test (sec): - ${MAX_DURATION_SEC}")
  logger.info(s"Maximum duration of test (sec): - ${MAX_DURATION_SEC}")
  logger.info(s"Debug: - ${DEBUG}")
  //logger.info(s"Pause on page navigation (sec): - ${PAUSE_NAVIGATION_SEC}")


  var users = s"${BASE_ENV}/users"
  var crud_users = s"${BASE_ENV}/crud_users"

  if (s"${DEBUG}" == "true") {
    crud_users = s"${BASE_ENV}/debug_user"
    users = s"${BASE_ENV}/debug_user"
    logger.info(s"UserFile: - ${crud_users}")
  }

  val userFeeders = createFeeder(users).random
  val crudUserFeeders = createFeeder(crud_users).random

  // ********************************************************
  // * data.user.feed  - Only For Data Creation - Donot Run *
  // ********************************************************

  val udsDataUserFeed = scenario("DataUserFeed").feed(userFeeders)
    .during(EXECUTION_TIME_SEC){
      exec(LoginScenario.scenario)
        .exec(DataUserQuery.scenario)
        .pause(THINK_TIME_SEC)
        .exec{
          session =>
            var document_count_delta = FEED_MAX_DOCUMENT_COUNT - session("documentCount").as[Int]
            if (document_count_delta < 1){
              document_count_delta = 0
            }

            session.set("document_delta", document_count_delta)
        }
        .doIf(session => session("documentCount").as[Int]  < FEED_MAX_DOCUMENT_COUNT) {
          repeat(session => session("document_delta").as[Int]) {
            exec(DataUserSet.scenario)
          }

        }
    }

  // ********************************************************
  // *                data.user.xxxx                        *
  // ********************************************************

  val udsDataUserQuery = scenario("DataUserQuery").feed(userFeeders)
    .during(EXECUTION_TIME_SEC){
      exec(LoginScenario.scenario)
        .exec(DataUserQuery.scenario)
        .pause(THINK_TIME_SEC)
    }

  val udsDataUserSet = scenario("DataUserSet").feed(userFeeders)
    .during(EXECUTION_TIME_SEC){
      exec(LoginScenario.scenario)
        .exec(DataUserSet.scenario)
        .pause(THINK_TIME_SEC)
    }

  val udsDataUserList = scenario("DataUserList").feed(userFeeders)
    .during(EXECUTION_TIME_SEC){
      exec(LoginScenario.scenario)
        .exec(DataUserList.scenario)
        .pause(THINK_TIME_SEC)
    }

  val udsDataUserSetGetDelete = scenario("DataUserSetGetDelete").feed(userFeeders)
    .during(EXECUTION_TIME_SEC){
      exec(LoginScenario.scenario)
        .exec(DataUserSet.scenario)
        .exec(DataUserGet.scenario)
        .exec(DataUserDelete.scenario)
        .pause(THINK_TIME_SEC)
    }


  // ********************************************************
  // *                data.cb.xxxx                          *
  // ********************************************************


  val udsDataCbQuery = scenario("DataCbQuery").feed(userFeeders)
    .during(EXECUTION_TIME_SEC){
      exec(LoginScenario.scenario)
        .exec(DataCbQuery.scenario)
        .pause(THINK_TIME_SEC)
    }

  val udsDataCbSet = scenario("DataCbSet").feed(userFeeders)
    .during(EXECUTION_TIME_SEC){
      exec(LoginScenario.scenario)
        .exec(DataCbSet.scenario)
        .pause(THINK_TIME_SEC)
    }

  val udsDataCbMerge = scenario("DataCbMerge").feed(userFeeders)
    .during(EXECUTION_TIME_SEC){
      exec(LoginScenario.scenario)
        .exec(DataCbMerge.scenario)
        .pause(THINK_TIME_SEC)
    }

  val udsDataCbGet = scenario("DataCbGet").feed(userFeeders)
    .during(EXECUTION_TIME_SEC){
      exec(LoginScenario.scenario)
        .exec(DataCbGet.scenario)
        .pause(THINK_TIME_SEC)
    }

  val udsDataCbIncrement = scenario("DataCbIncrement").feed(userFeeders)
    .during(EXECUTION_TIME_SEC){
      exec(LoginScenario.scenario)
        .exec(DataCbIncrement.scenario)
        .pause(THINK_TIME_SEC)
    }

  val udsDataCbDecrement = scenario("DataCbDecrement").feed(userFeeders)
    .during(EXECUTION_TIME_SEC){
      exec(LoginScenario.scenario)
        .exec(DataCbDecrement.scenario)
        .pause(THINK_TIME_SEC)
    }

  val udsDataCbUnSet = scenario("DataCbUnSet").feed(userFeeders)
    .during(EXECUTION_TIME_SEC){
      exec(LoginScenario.scenario)
        .exec(DataCbUnSet.scenario)
        .pause(THINK_TIME_SEC)
    }



  // ********************************************************
  // *                data.app.xxxx                         *
  // ********************************************************

  val udsDataAppQuery = scenario("DataAppQuery").feed(userFeeders)
    .during(EXECUTION_TIME_SEC){
      exec(LoginScenario.scenario)
        .exec(DataAppQuery.scenario)
        .pause(THINK_TIME_SEC)
    }

  val udsDataAppSetMergeGetDelete = scenario("DataAppSetMergeGetDelete").feed(userFeeders)
    .during(EXECUTION_TIME_SEC){
      exec(LoginScenario.scenario)
        .exec(DataAppSet.scenario)
        .exec(DataAppMerge.scenario)
        .exec(DataAppGet.scenario)
        .exec(DataAppDelete.scenario)
        .pause(THINK_TIME_SEC)
    }


  val udsDataAppList = scenario("DataAppList").feed(userFeeders)
    .during(EXECUTION_TIME_SEC){
      exec(LoginScenario.scenario)
        .exec(DataAppList.scenario)
        .pause(THINK_TIME_SEC)
    }

  val udsDataAppMerge = scenario("DataAppMerge").feed(userFeeders)
    .during(EXECUTION_TIME_SEC){
      exec(LoginScenario.scenario)
        .exec(DataAppMerge.scenario)
        .pause(THINK_TIME_SEC)
    }

  /*
    val udsDataAppGet = scenario("DataAppGet").feed(userFeeders)
      .during(EXECUTION_TIME_SEC){
        exec(LoginScenario.scenario)
          .exec(DataAppGet.scenario)
          .pause(THINK_TIME_SEC)
      }


      val udsDataAppSet = scenario("DataAppSet").feed(userFeeders)
      .during(EXECUTION_TIME_SEC){
        exec(LoginScenario.scenario)
          .exec(DataAppSet.scenario)
          .pause(THINK_TIME_SEC)
      }
  */





  var testSetup = setUp(
          //udsDataFeed.inject(rampUsers(getWorkLoad("udsDataFeed")) over (RAMP_UP_SEC))

    udsDataUserQuery.inject(rampUsers(getWorkLoad("udsDataUserQuery")) over (RAMP_UP_SEC)),
    udsDataUserList.inject(rampUsers(getWorkLoad("udsDataUserList")) over (RAMP_UP_SEC)),
    udsDataUserSetGetDelete.inject(rampUsers(getWorkLoad("udsDataUserSetGetDelete")) over (RAMP_UP_SEC)),

    udsDataCbQuery.inject(rampUsers(getWorkLoad("udsDataCbQuery")) over (RAMP_UP_SEC)),
    udsDataCbSet.inject(rampUsers(getWorkLoad("udsDataCbSet")) over (RAMP_UP_SEC)),
    udsDataCbMerge.inject(rampUsers(getWorkLoad("udsDataCbMerge")) over (RAMP_UP_SEC)),
    udsDataCbGet.inject(rampUsers(getWorkLoad("udsDataCbGet")) over (RAMP_UP_SEC)),
    udsDataCbDecrement.inject(rampUsers(getWorkLoad("udsDataCbDecrement")) over (RAMP_UP_SEC)),
    udsDataCbIncrement.inject(rampUsers(getWorkLoad("udsDataCbIncrement")) over (RAMP_UP_SEC)),
    udsDataCbUnSet.inject(rampUsers(getWorkLoad("udsDataCbUnSet")) over (RAMP_UP_SEC)),

    udsDataAppQuery.inject(rampUsers(getWorkLoad("udsDataAppQuery")) over (RAMP_UP_SEC)),
    udsDataAppList.inject(rampUsers(getWorkLoad("udsDataAppList")) over (RAMP_UP_SEC)),
    udsDataAppSetMergeGetDelete.inject(rampUsers(getWorkLoad("udsDataAppSetMergeGetDelete")) over (RAMP_UP_SEC))

  ).maxDuration(MAX_DURATION_SEC)

  testSetup.protocols(getHttpConfLocal())

}
