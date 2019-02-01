
package com.hmhco.uds.performance.config

import com.typesafe.scalalogging.StrictLogging
import com.hmhco.uds.performance.config.Config._
import com.hmhco.uds.performance.utils.Utils._
import com.typesafe.scalalogging.StrictLogging

/**
  * Work Load distribution of usecases per Injector
  * Example "plGetDataScenario"	-> 14%
  * Avoid Total  % crossing 100
  */

object Workload extends StrictLogging {

  val wl = Map(
    "udsDataFeed" -> 0,
    "udsDataUserQuery" -> 50,
    "udsDataUserSet" -> 0,
    "udsDataUserList" -> 2,
    "udsDataUserDelete" -> 0,
    "udsDataUserSetGetDelete" -> 2,
    "udsDataCbIncrement" -> 10,
    "udsDataCbDecrement" -> 2,
    "udsDataCbGet" -> 3,
    "udsDataCbSet" -> 3,
    "udsDataCbQuery" -> 1,
    "udsDataCbUnSet" -> 2,
    "udsDataCbMerge" -> 2,
    "udsDataAppQuery" -> 4,
    "udsDataAppList" -> 3,
    "udsDataAppMerge" -> 1,
    "udsDataAppSetMergeGetDelete" -> 5,
    "udsDataAppSet" -> 0,
    "udsDataAppGet" -> 0
  )

  def getWorkLoad(name: String): Int = {
    val USERS = roundUp((wl(name) * NUMBER_OF_USERS) / 100.0)
    logger.info(s"WorkLoad => ${USERS} : ${name}")
    if (USERS < 1) 1 else USERS
  }
}
