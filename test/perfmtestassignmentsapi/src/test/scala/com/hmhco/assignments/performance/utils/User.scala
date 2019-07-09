package com.hmhco.assignments.performance.utils

import com.google.gson.Gson
import org.json4s.DefaultJsonFormats
import org.json4s.jackson.Serialization.write

import org.json4s._
import org.json4s.jackson.Serialization
import org.json4s.jackson.Serialization.write

class User {
  var username:String = _
  var password: String = _
  var tenantPid: String = _
  var token: String = _


  private implicit val formats = Serialization.formats(NoTypeHints)

  private val gson = new Gson


  def toJson():String = {
    val jsonString = gson.toJson(this)
    //val jsonString = write(this)
    return jsonString
  }

  def setToken(tokenJson:String)={
      token = gson.toJsonTree(tokenJson).getAsString
  }

}

object User {
  private val utils = new Utils()
  def apply(username:String, password:String, tenantPid:String):User = {
    val u = new User
    u.username = username
    u.password = password
    u.tenantPid = tenantPid
    u
    //u.setToken(utils.getAuthToken(user))
  }


}