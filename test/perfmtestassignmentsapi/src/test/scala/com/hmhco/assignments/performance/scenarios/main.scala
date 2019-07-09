package com.hmhco.assignments.performance.scenarios

import com.hmhco.assignments.performance.utils.{User, Utils}
import io.gatling.core.Predef.csv
import org.json4s.jackson.Serialization.write
import org.json4s.DefaultFormats
import org.json4s.jackson.Serialization.write

  object HelloWorld extends App {



    implicit val formats = DefaultFormats


    println("Hello, world!")
      val user = User("goldenglow_moth", "P@ssword1", "92001080")

    val jsonString = write(user)

      var tokenJson = new Utils().getAuthToken("goldenglow_moth", "P@ssword1", "92001080")
      user.setToken(tokenJson);
      print(user.toJson())

   // val records: Seq[Map[String, Any]] = csv( "teachers.csv").readRecords


  }


