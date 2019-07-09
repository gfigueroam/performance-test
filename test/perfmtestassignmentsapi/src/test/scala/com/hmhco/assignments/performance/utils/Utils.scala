package com.hmhco.assignments.performance.utils

import com.google.gson.Gson
import com.hmhco.assignments.performance.config.Config
import com.typesafe.scalalogging.StrictLogging
import scalaj.http.{Http, HttpOptions}
import org.json4s.DefaultFormats
import org.json4s.jackson.JsonMethods.parse

class Utils extends StrictLogging {

  private val gson = new Gson

  implicit val formats = DefaultFormats

  /*def getAuthToken(user: User): String = {

    val result = Http(Config.AUTHENTICATION_URL)
      .postData(user.toJson())
      .header("Content-Type", "application/json")
      .header("Accept", "application/json")
      .header("Charset", "UTF-8")
      .option(HttpOptions.readTimeout(10000)).asString
    val parsedJson = parse(result.body)
    val jsonObject = (parsedJson\"sifToken").extract[String]
    return jsonObject;
  }*/

  def getAuthToken(username: String, password: String, tenantPid:String ): String = {
    val user = User(username,password,tenantPid )
    val result = Http(Config.AUTHENTICATION_URL)
      .postData(user.toJson())
      .header("Content-Type", "application/json")
      .header("Accept", "application/json")
      .header("Charset", "UTF-8")
      .option(HttpOptions.readTimeout(10000)).asString
    val parsedJson = parse(result.body)
    val jsonObject = (parsedJson\"sifToken").extract[String]
    //logger.info(s"Logging In with user: $jsonObject")
    return jsonObject;
  }

}
