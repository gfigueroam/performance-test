package com.hmhco.uds.performance.scenarios

import com.hmhco.quality.performance.config.Config
import com.hmhco.uds.performance.config.{ Config => UDSConfig }

import io.gatling.core.Predef._
import io.gatling.core.structure.ChainBuilder
import io.gatling.http.Predef._
import io.gatling.http.request.builder.HttpRequestBuilder


trait BaseUserDataScenario {

  // Properties that each subclass scenario must define
  def method: String
  def description: String

  // Subclasses need to define their own scenario
  def scenario: ChainBuilder


  // Get the correct target Id and URL based on environment
  val env: String = Config.TARGET_ENV

  val targetId: String = UDSConfig.targetIds(env)
  val udsUrl: String = UDSConfig.environmentUrls(env)

  val headerMap: Map[String, String] = UDSConfig.headerMap(env)

  // Define a shared user data key and value to be used in tests
  val key: String = "uds.perf.test.user.data.get.key"
  val value: String = "uds.perf.test.user.data.set.value"

  // Define the pre-test actions to get token based on environment
  def setupToken: ChainBuilder = UDSConfig.setupTokenActions(env)

  // Shared code to define the basics of the UDS request
  def httpRequest: HttpRequestBuilder =
    http(description)
      .post(s"${udsUrl}/${method}")
      .headers(headerMap)

}
