'use strict';
const express = require('express') ;
const http = require('http') ;
const bodyParser = require('body-parser');
const unirest = require('unirest');

const deviceFunctionsService = require('./deviceFunctions')
var PORT = process.env.PORT || 5000;
var keepAliveTimeId;

const SORRY_DIALOGUE = 'Sorry not able to complete request';
const { conversation } = require('@assistant/conversation');

// Create an app instance
const app = conversation({
  debug: true
});
// Register handlers for Dialogflow intents

app.handle('actions.intent.MAIN', conv => {
  conv.add('Hi, how is it going?')
})

app.handle('Default_Welcome_Intent', async conv => {
  conv.add('What do you want to do?')
})

app.handle('Turn_On', async conv => {
  try{
    var response = await deviceFunctionsService.turnOn()
    conv.add(response)
  }catch(e){
    console.log(e);
    conv.add(SORRY_DIALOGUE)
  }
})

app.handle('Turn_Off', async conv => {
  try{
    var response = await deviceFunctionsService.turnOff()
    conv.add(response)
  }catch(e){
    console.log(e);
    conv.add(SORRY_DIALOGUE)
  }
})

app.handle('Set_Temperature', async conv => {
  try{
    console.log(conv.intent.params.thermostatCoolingSetpoint.resolved);
    var setTemperature =conv.intent.params.thermostatCoolingSetpoint.resolved;
    if(setTemperature>30 || setTemperature <16){
      conv.add('Temperature should be between 16 to 30')
    }else{
      var response = await deviceFunctionsService.setTemperature(setTemperature)
      conv.add(response)
    }
  }catch(e){
    console.log(e);
    if(e instanceof TypeError){
      conv.add('Sorry, temperature should be between 16 to 30')
    } else{
      conv.add(SORRY_DIALOGUE)
    }
  }
})

app.handle('Air_Condition_Mode', async conv => {
  try{
    console.log(conv.intent.params.airconditionermode.resolved);
    var setMode = conv.intent.params.airconditionermode.resolved;
    if(setMode == "cool" || setMode == "dry" || setMode == "auto" || setMode == "wind"){
      var response = await deviceFunctionsService.setMode(setMode)
      conv.add(response)
    }else{
      conv.add('Device mode can only be set to Auto, low, medium, high or turbo')
    }
  }catch(e){
    console.log(e);
    if(e instanceof TypeError){
      conv.add('Device mode can only be set to Auto, low, medium, high or turbo')
    } else{
      conv.add(SORRY_DIALOGUE)
    }
  }
})

app.handle('Air_Condition_Fan_Mode', async conv => {
  try{
    console.log(conv.intent.params.airconditionerfanmode.resolved);
    var setFanMode = conv.intent.params.airconditionerfanmode.resolved;
    if(setFanMode == "auto" || setFanMode == "low" || setFanMode == "medium" || setFanMode == "high" || setFanMode == "turbo"){
      var response = await deviceFunctionsService.setFanMode(setFanMode)
      conv.add(response)
    }else{
      conv.add('Fan mode can only be set to Auto, low, medium, high or turbo')
    }
  }catch(e){
    console.log(e);
    if(e instanceof TypeError){
      conv.add('Fan mode can only be set to Auto, low, medium, high or turbo')
    } else{
      conv.add(SORRY_DIALOGUE)
    }
  }
})

app.handle('Air_Condition_Status', async conv => {
  try{
      var response = await deviceFunctionsService.getDeviceStatus()
      conv.add(response)
  }catch(e){
    console.log(e);
    conv.add(SORRY_DIALOGUE)
  }
})

app.handle('Cancel', conv => {
  conv.add('Okay, have a nice day')
})

app.handle('no_input', (conv) => {
    conv.add('Hi, how is it going?')
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
        console.log(res.error);
      }
      else {
        console.log("Pinging done with response - "+ res.raw_body);
     }
   });
 }, 60000*10);//keep pinging server in 10 min
}
