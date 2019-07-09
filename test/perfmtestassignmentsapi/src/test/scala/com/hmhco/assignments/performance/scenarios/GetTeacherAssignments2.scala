package com.hmhco.assignments.performance.scenarios

import com.hmhco.assignments.performance.config.Config
import com.hmhco.assignments.performance.utils.{SimulationTraits, Utils}
import io.gatling.core.Predef._
import io.gatling.core.structure.ScenarioBuilder
import io.gatling.http.Predef._
import io.gatling.http.protocol.HttpProtocolBuilder

class GetTeacherAssignments2 extends Simulation with SimulationTraits {


  private val authorization = "SIF_HMACSHA256 ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKb2RIUndjem92TDJsa1pXNTBhWFI1TG1Gd2FTNW9iV2hqYnk1amIyMGlMQ0poZFdRaU9pSm9kSFJ3T2k4dmQzZDNMbWh0YUdOdkxtTnZiU0lzSW1saGRDSTZNVFUyTVRrNU5qY3hOU3dpYzNWaUlqb2lZMjVjZFRBd00yUkhiMnhrWlc1bmJHOTNJRTF2ZEdnc2RXbGtYSFV3TUROa1oyOXNaR1Z1WjJ4dmQxOXRiM1JvTEhWdWFYRjFaVWxrWlc1MGFXWnBaWEpjZFRBd00yUTNPRGcxWkdJMFl5MWlNalJrTFRReU1EZ3RPRFZsWXkwelpXUTBZamc0T1RVeE1EZ3NiMXgxTURBelpEa3lNREF3TkRjMUxHUmpYSFV3TUROa09USXdNREEwTnpRaUxDSm9kSFJ3T2k4dmQzZDNMbWx0YzJkc2IySmhiQzV2Y21jdmFXMXpjSFZ5YkM5c2FYTXZkakV2ZG05allXSXZjR1Z5YzI5dUlqcGJJa2x1YzNSeWRXTjBiM0lpWFN3aVpHbHpkRjlwWkNJNklqUmtNVEF4TURneExURmxOR0l0TkdZellTMWhNR1kzTFdFNVlqZzVPR0l3TVdSaU55SXNJbk5qYUc5dmJGOXBaQ0k2SWpobVlXTmhOR1UwTFdJeU56UXROR1l3TkMwNE1qTXpMVGhoTnpoaU1HTTNZMlZtTnlJc0luTmphRzl2YkY5eVpXWnBaQ0k2SWpobVlXTmhOR1UwTFdJeU56UXROR1l3TkMwNE1qTXpMVGhoTnpoaU1HTTNZMlZtTnlJc0lsQnNZWFJtYjNKdFNXUWlPaUpKUkZNaUxDSmpiMjUwWlhoMFNXUWlPaUlpTENKa2FYTjBYM0psWm1sa0lqb2lOR1F4TURFd09ERXRNV1UwWWkwMFpqTmhMV0V3WmpjdFlUbGlPRGs0WWpBeFpHSTNJaXdpYzJOb2IyOXNYMk5oZEdWbmIzSjVJam9pSWl3aWFuUnBJam9pTXpkaU1XTTVNbVV0TnpCbE1DMDBaRE14TFRnek16UXRNV0ZqTWpWak9EQTFZemMzSWl3aVkyeHBaVzUwWDJsa0lqb2lNVFV5WTJWa05UQXRNVE0yT1MwMFlqRTVMVGhpTWpZdE9HWXpaRFZrT1dKbVpEWmhMbWh0YUdOdkxtTnZiU0lzSW1WNGNDSTZNVFUyTWpBNE16RXhOWDAuZHdoYlplOFRMcW03cEd5OUtQUkxuaFdKX19ieUFuZ2xsbTBTc3hwV3ZJNDpuYjVCK2dJZTlzUXZ3RlNMTW01MzVvaUJ4S1hET2dDZXNRa0UvbThycVhVPQo="
  private val pass = "Q1w2e3r4"

  private val contentType = "application/json;charset=UTF-8"

  private val authUser= "blaze"
  private val requestCount = 1

  private val endpoint = "/v2/teacherAssignments"
  private val endpoint_health = "/health"



  val utils = new Utils
  val userFeeders = createFeeder("teachers")

  val httpProtocol: HttpProtocolBuilder = http
    .baseUrl(Config.BASE_URL)
    .headers(Config.commonHeader)
    //.acceptHeader("application/json")
    //.authorizationHeader(authorization)
    //.authorizationHeader(basicAuthHeader)
    //.contentTypeHeader(contentType)


    //.userAgentHeader("curl/7.54.0")

  //val headers_0 = Map("Expect" -> "100-continue")



  def escenario: ScenarioBuilder = scenario("get")
    .feed(userFeeders)
    //.exec(LoginScenario.scenario)
    .exec(http("get")
      .get(endpoint)
        .header("authorization",  session => {
           utils.getAuthToken(
            session("token").as[String],
            session("password").as[String],
            session("districtPID").as[String])
        })
      .check(status.is(200)))


  setUp(escenario.inject(atOnceUsers(requestCount))).protocols(httpProtocol)
}
