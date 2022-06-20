'use strict';
const authService = require('./auth')
const networkCallService = require('./networkCall');

const SCENE_URL = 'https://client.smartthings.com/scenes/execute?locationId=59357b01-4de5-4f4b-8c7d-9e8991f1a009';
const STATUS_URL = 'https://client.smartthings.com/devices/status?includeUserDevices=true&excludeLocationDevices=false';
const HEALTH_URL = 'https://client.smartthings.com/devices/health?includeUserDevices=true&excludeLocationDevices=false'
async function turnOn(){
  var header = { 'Authorization': 'Bearer '+ authService.getToken(), 'accept': 'application/vnd.smartthings+json;v=3'};
  try {
     var commandList = []
     var onCommand = getCommandBody("switch","on")
     commandList.push(onCommand)
     var body = getRequestBody(commandList)
     var res = await postCall(SCENE_URL,header,body);
     if(res.result =="Success"){
       return 'Device is turned on';
     } else {
       if(res.actions[0].command[0].result == "Offline"){
         return 'Device seems to be offline';
       } else {
         return 'There seems to be problem with device'
       }
     }
  } catch (e) {
     console.log(e);
     return "Sorry, unable to complete request"
  }
}

async function turnOff(){
  var header = { 'Authorization': 'Bearer '+ authService.getToken(), 'accept': 'application/vnd.smartthings+json;v=3'};
  try {
     var commandList = []
     var offCommand = getCommandBody("switch","off")
     commandList.push(offCommand)
     var body = getRequestBody(commandList)
     var res = await postCall(SCENE_URL,header,body);
     if(res.result =="Success"){
       return 'Device is turned off';
     } else {
       if(res.actions[0].command[0].result == "Offline"){
         return 'Device seems to be offline';
       } else {
         return 'There seems to be problem with device'
       }
     }
  } catch (e) {
     console.log(e);
     return "Sorry, unable to complete request"
  }
}

async function setTemperature(temperature){
  var header = { 'Authorization': 'Bearer '+ authService.getToken(), 'accept': 'application/vnd.smartthings+json;v=3'};
  try {
     var commandList = []
     var argument = getArgumentDecimal(temperature)
     var temperatureCommand = getCommandBodyWithArgument("thermostatCoolingSetpoint","setCoolingSetpoint",argument)
     commandList.push(temperatureCommand)
     var onCommand = getCommandBody("switch","on")
     commandList.push(onCommand)
     var body = getRequestBody(commandList)
     var res = await postCall(SCENE_URL,header,body);
     if(res.result =="Success"){
       return 'Temperature is set to '+temperature+' degree celcius';
     } else {
       if(res.actions[0].command[0].result == "Offline"){
         return 'Device seems to be offline';
       } else {
         return 'There seems to be problem with device'
       }
     }
  } catch (e) {
     console.log(e);
     return "Sorry, unable to complete request"
  }
}

async function setMode(setMode){
  var header = { 'Authorization': 'Bearer '+ authService.getToken(), 'accept': 'application/vnd.smartthings+json;v=3'};
  try {
     var commandList = []
     var argument = getArgumentString(setMode)
     var modeCommand = getCommandBodyWithArgument("airConditionerMode","setAirConditionerMode",argument)
     commandList.push(modeCommand)
     var onCommand = getCommandBody("switch","on")
     commandList.push(onCommand)
     var body = getRequestBody(commandList)
     var res = await postCall(SCENE_URL,header,body);
     if(res.result =="Success"){
       return 'Device mode is set to '+setMode;
     } else {
       if(res.actions[0].command[0].result == "Offline"){
         return 'Device seems to be offline';
       } else {
         return 'There seems to be problem with device'
       }
     }
  } catch (e) {
     console.log(e);
     return "Sorry, unable to complete request"
  }
}

async function setFanMode(setFanMode){
  var header = { 'Authorization': 'Bearer '+ authService.getToken(), 'accept': 'application/vnd.smartthings+json;v=3'};
  try {
     var commandList = []
     var argument = getArgumentString(setFanMode)
     var modeCommand = getCommandBodyWithArgument("airConditionerFanMode","setFanMode",argument)
     commandList.push(modeCommand)
     var onCommand = getCommandBody("switch","on")
     commandList.push(onCommand)
     var body = getRequestBody(commandList)
     var res = await postCall(SCENE_URL,header,body);
     if(res.result =="Success"){
       return 'Device fan speed is set to '+setFanMode;
     } else {
       if(res.actions[0].command[0].result == "Offline"){
         return 'Device seems to be offline';
       } else {
         return 'There seems to be problem with device'
       }
     }
  } catch (e) {
     console.log(e);
     return "Sorry, unable to complete request"
  }
}

async function getDeviceStatus(){
  var header = { 'Authorization': 'Bearer '+ authService.getToken(), 'accept': 'application/vnd.smartthings+json;v=4'};
  try {
     var initialResponse = await getRequest(HEALTH_URL,header);
     if(initialResponse.items[0].state == "ONLINE"){
       var header = { 'Authorization': 'Bearer '+ authService.getToken()};
       var res = await getRequest(STATUS_URL,header);
       var ans = ""
       var switchStatus = false
       res.items.forEach(element => {
        if(element.attributeName == "switch"){
          if(element.value != "off"){
            switchStatus = true
          }
        }
       });
       if(switchStatus){
         res.items.forEach(element => {
          if(element.attributeName == "airConditionerMode"){
            ans = ans + "Device is running on "+element.value+". "
          }
          if(element.attributeName == "temperature"){
            ans = ans + "Outside temperature is "+element.value+". "
          }
          if(element.attributeName == "coolingSetpoint"){
            ans = ans + "AC Temperature is set to "+element.value+". "
          }
         });
         return ans;
       } else {
         return "Your device is off."
       }
     } else {
       return "Your device is offline."
     }
  } catch (e) {
     console.log(e);
     return "Sorry, unable to complete request"
  }
}

async function getRequest(url,header){
  try {
    var response = await networkCallService.doGetCall(url,header)
    var body = JSON.parse(response.raw_body);
    return body
  } catch (e1) {
    console.log("e1 "+e1);
    if(e1.status == 401){
      var accessToken = ""
      try {
       accessToken = await authService.refreshToken();
       try {
         header['Authorization'] ='Bearer '+ accessToken
         var response = await networkCallService.doGetCall(url,header)
         var body = JSON.parse(response.raw_body);
         return body
       } catch (e3) {
         console.log("e3 "+e3);
         throw new Error(e3);
       }
      } catch (e2) {
        console.log("e2 "+e2);
        throw new Error(e2);
      }
    } else{
      throw new Error(e1)
    }
  }
}

async function postCall(url,header,body){
  try {
    var response = await networkCallService.doPostCall(url,header,body)
    var body = JSON.parse(response.raw_body);
    return body
  } catch (e1) {
    console.log("e1 "+e1);
    if(e1.status == 401){
      var accessToken = ""
      try {
       accessToken = await authService.refreshToken();
       try {
         header['Authorization'] ='Bearer '+ accessToken
         var response = await networkCallService.doPostCall(url,header,body)
         var body = JSON.parse(response.raw_body);
         return body
       } catch (e3) {
         console.log("e3 "+e3);
         throw new Error(e3);
       }
      } catch (e2) {
        console.log("e2 "+e2);
        throw new Error(e2);
      }
    } else{
      throw new Error(e1)
    }
  }
}

function getRequestBody(commands){
  return {
  "actions": [
    {
      "command": {
        "commands": commands,
        "devices": [
          "b04e2176-0394-7fc9-5ed2-5a6846d35535"
        ]
      },
      "type": "command"
    }
  ],
  "meta": {
    "clientInfo": {
      "userOSType": "Android",
      "userSTAppVersion": "1.7.85.25"
    },
    "creator": "builder",
    "hidden": false,
    "icon": "201",
    "ruleVersion": "1.03"
  },
  "name": "Custom",
  "sequence": {
    "actions": "Parallel"
  }
 }
}

function getCommandBody(capability,command){
  return {
                "capability": capability,
                "command": command,
                "component": "main"
        }
}

function getCommandBodyWithArgument(capability,command,argument){
  return {
                "capability": capability,
                "command": command,
                "component": "main",
                "arguments": [
                  argument
                ],
        }
}

function getArgumentDecimal(decimal){
  return {
                "decimal": decimal,
                "type": "decimal"
              }
}

function getArgumentString(value){
  return {
                "string": value,
                "type": "string"
              }
}

authService.initializeToken();

module.exports = {turnOn,turnOff,setTemperature,setMode,setFanMode,getDeviceStatus};
