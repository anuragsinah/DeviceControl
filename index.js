'use strict';
const express = require('express') ;
const http = require('http') ;
const bodyParser = require('body-parser');
const unirest = require('unirest');

const deviceFunctionsService = require('./deviceFunctions')
var PORT = process.env.PORT || 5000;
var keepAliveTimeId;

const SORRY_DIALOGUE = 'Sorry not able to complete request';
const {
  dialogflow
} = require('actions-on-google')

// Create an app instance
const app = dialogflow({
  debug: true
});
// Register handlers for Dialogflow intents

app.intent('actions.intent.MAIN', conv => {
  conv.close('Hi, how is it going?')
})

app.intent('Default Welcome Intent', async conv => {
  conv.ask('What do you want to do?')
})

app.intent('Turn On', async conv => {
  try{
    var response = await deviceFunctionsService.turnOn()
    conv.close(response)
  }catch(e){
    conv.close(SORRY_DIALOGUE)
  }
})

app.intent('Turn Off', async conv => {
  try{
    var response = await deviceFunctionsService.turnOff()
    conv.close(response)
  }catch(e){
    conv.close(SORRY_DIALOGUE)
  }
})

app.intent('Set Temperature', async conv => {
  try{
    console.log(conv.parameters.thermostatCoolingSetpoint);
    var setTemperature = conv.parameters.thermostatCoolingSetpoint;
    if(setTemperature>30 || setTemperature <16){
      conv.ask('Temperature should be between 16 to 30')
    }else{
      var response = await deviceFunctionsService.setTemperature(setTemperature)
      conv.close(response)
    }
  }catch(e){
    conv.close(SORRY_DIALOGUE)
  }
})

app.intent('Air Condition Mode', async conv => {
  try{
    console.log(conv.parameters.airconditionermode);
    var setMode = conv.parameters.airconditionermode;
    if(setMode == "cool" || setMode == "dry" || setMode == "auto" || setMode == "wind"){
      var response = await deviceFunctionsService.setMode(setMode)
      conv.close(response)
    }else{
      conv.ask('What mode you want to set? Auto, cool, wind or dry')
    }
  }catch(e){
    conv.close(SORRY_DIALOGUE)
  }
})

app.intent('Air Condition Fan Mode', async conv => {
  try{
    console.log(conv.parameters.airconditionerfanmode);
    var setFanMode = conv.parameters.airconditionerfanmode;
    if(setFanMode == "auto" || setFanMode == "low" || setFanMode == "medium" || setFanMode == "high" || setFanMode == "turbo"){
      var response = await deviceFunctionsService.setFanMode(setFanMode)
      conv.close(response)
    }else{
      conv.ask('What mode you want to set? Auto, low, medium, high or turbo')
    }
  }catch(e){
    conv.close(SORRY_DIALOGUE)
  }
})

app.intent('Air Condition Status', async conv => {
  try{
      var response = await deviceFunctionsService.getDeviceStatus()
      conv.close(response)
  }catch(e){
    conv.close(SORRY_DIALOGUE)
  }
})

app.intent('Cancel', conv => {
  conv.close('Okay, have a nice day')
})

app.intent('no_input', (conv) => {
    conv.close('Hi, how is it going?')
});

var exp = new express() ;
exp.use(bodyParser.json()) ;
exp.post('/', app);

var server = http.createServer(exp);
server.listen(PORT,(req, res)=>{
    console.log('Server listening in '+PORT);
    startKeepAlive();
})

function startKeepAlive(){
  keepAliveTimeId = setInterval(async function() {
    console.log("Pinging to herokuapp");
    var url = 'https://devicecontrol1.herokuapp.com/';
    unirest.get(url)
    .end(function(res) {
      if (res.error) {
        console.log('error in pinging') ;
      }
      else {
        console.log("Pinging done with response - "+ res.raw_body);
     }
   });
 }, 60000*10);//keep pinging server in 10 min
}
