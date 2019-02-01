package  com.hmhco.uds.performance.utils

import com.typesafe.scalalogging.StrictLogging
//import io.gatling.commons.validation._
import io.gatling.core.Predef._
import io.gatling.core.body.StringBody
//import scala.io.Source
import java.io.{InputStream}
//import java.io.{File, InputStream}
import scala.collection.mutable.Map


trait  UITraits extends StrictLogging {


  val cbKeys = Array("homeless","collar","receive","distinct","remind","glove","panoramic",
                  "fragile","harsh","treatment","polite","love","spotless","grey","six",
                  "jump","mist","disappear","tremble","literate","whistle","hill","futuristic","library",
                  "flippant","absorbing","arrest","helpful","jellyfish","animal")

  val appNames = Array("interactions","planner","uds.bvt.data.admin.apps.app.87.9","archived-plan")


  //strip \r and \n from query text and add to query json
  def formatGraphQlQuery(query : String) : StringBody = {
    val q = query.replaceAll("\r", " ").replaceAll("\n", " ")
    return StringBody(s""" { "query":" ${q} " } """)
  }

  //strip \r and \n from query text and add to query json
  def formatJSON(query : String) : String = {
    val q = query.replaceAll("\r", " ").replaceAll("\n", " ")
    return (s"""${q}""")
  }

  def loadJSON(fileName: String, rmap: Map[String,String]): String = {
    var rawMessage: String = ""
    val stream : InputStream = getClass.getResourceAsStream(s"/quries/${fileName}.json")
    val lines = scala.io.Source.fromInputStream( stream ).getLines

    for (line <- lines) rawMessage  += line

    rawMessage = rmap.foldLeft(rawMessage)((a, b) => a.replaceAllLiterally(b._1, b._2))

    //val templateStringJson: String = formatGraphQlQueryString(rawMessage.replaceAll("\"" , "\\\\\""))
    val templateStringJson: String = formatJSON(rawMessage)
    templateStringJson
  }


}
