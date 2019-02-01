package com.hmhco.uds.performance.scenarios

import com.typesafe.scalalogging.StrictLogging
import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.core.structure.ChainBuilder
import io.gatling.http.request.builder.HttpRequestBuilder
import com.hmhco.uds.performance.config.Config._


trait BaseScenario  extends StrictLogging {

  // Properties that each subclass scenario must define
  def method: String
  def description: String

  // Subclasses need to define their own scenario
  def scenario: ChainBuilder

  // Get the correct target Id and URL based on environment
  var env: String = System.getProperty("env", "int")

  //val targetId: String = PlannerConfig.targetIds(env)
  val plannerUrl: String = environmentUrls(env)

  val headerMapLocal: Map[String, String] = headerMap(env)

  // Shared code to define the basics of the Planner request
  def httpRequest: HttpRequestBuilder =
    http(description)
      .post(s"${plannerUrl}/${method}")
      .headers(headerMapLocal)

}
