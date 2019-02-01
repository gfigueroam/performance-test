package com.hmhco.uds.performance.utils

import com.typesafe.scalalogging.StrictLogging
import io.gatling.http.request.ExtraInfo
import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.http.protocol.HttpProtocolBuilder
import com.typesafe.scalalogging.StrictLogging
import io.gatling.core.body.StringBody
import scala.util.Random
import com.hmhco.uds.performance.config.Config._

object Utils extends  UITraits {

  def r = new scala.util.Random

  def uuid() = java.util.UUID.randomUUID.toString

  def roundUp(d: Double) = math.round(d).toInt

  def getHttpConfLocal(): HttpProtocolBuilder = {
    http.extraInfoExtractor(extraInfo => List(onFailure(extraInfo)))
  }


  def onFailure(extraInfo: ExtraInfo) {

    val DEBUG = System.getProperty("debug","false")

    if (DEBUG == "true"  || extraInfo.status.toString() == "KO") {
      val url = "\n****** " + " Request Name: " + extraInfo.requestName + ",\n Status: " + extraInfo.status +
        "\n" + " Request Status:" + extraInfo.response.statusCode + "\n Request: " + extraInfo.request +
        "\n" + " Request Body: " + extraInfo.request.getStringData +
        "\n" + " Response Header: " + extraInfo.response.headers.entries ().toString () +
        "\n" + " Response: " + extraInfo.response.body.string +
        "\n" + " Response Body Length:" + extraInfo.response.bodyLength+
        "\n" + " Session:" + extraInfo.session+ " ***** \n"
      logger.info (url)
      }
  }

  def randomIntBetween(startInt: Int , endInt: Int) = startInt +  r.nextInt((endInt - startInt) + 1)

  // Generate a random string of length n from the given alphabet
  def randomString(alphabet: String)(n: Int): String = Stream.continually(Random.nextInt(alphabet.size)).map(alphabet).take(n).mkString

  // Generate random strings of length n for various alphabets/character sets
  def randomAlphanumericString(n: Int) = randomString("abcdefghijklmnopqrstuvwxyz0123456789")(n)
  def randomNnumericString(n: Int) = randomString("0123456789")(n)
  def randomAlphaString(n: Int) = randomString("abcdefghijklmnopqrstuvwxyz")(n)
  def randomAlphaText(n: Int) = randomString("abcdefghijklmnopqrstuvwxyz ,.")(n)


}
