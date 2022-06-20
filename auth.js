const networkCallService = require('./networkCall');
const fs = require('fs')
const admin=require('firebase-admin');
var maccess_token = ""
var mrefresh_token = ""

function initializeToken(){
  startSnapshortToken();
}

function setTokensFromFirebase(tokens){
  try {
    console.log("Tokens retrived refresh_token is:", tokens.refresh_token);
    maccess_token = tokens.access_token;
    mrefresh_token = tokens.refresh_token;
    return tokens;
  } catch (err) {
    console.log("Error parsing JSON string:", err);
  }
}

function saveTokens(tokens){
  maccess_token = tokens.access_token;
  mrefresh_token = tokens.refresh_token;
  updateTokens(tokens)
}

function getToken(){
  return maccess_token;
}

async function refreshToken(){
  var url = 'https://eu-auth2.samsungosp.com/auth/oauth2/token'
  var header={}
  var body = {'grant_type':'refresh_token','refresh_token': mrefresh_token, 'client_id':process.env.samsung_client_id}
  try{
    var response = await networkCallService.doPostURLEncodedCall(url, header, body)
    console.log(response.raw_body);
    var body = JSON.parse(response.raw_body);
    saveTokens(body)
    return (body.access_token)
  }catch(err){
    console.log(err);
    throw new Error(err)
  }
}



/////////////////////////////FireBase/////////////////////////////////////////////////////////////////////////////////////

// var serviceAccount = require("C:/Users/Aagam/Desktop/Personal/Device_Control_AC/serviceAccountKey.json");

var serviceAccount = {
  "type": "service_account",
  "project_id": process.env.project_id,
  "private_key_id": process.env.private_key_id,
  "private_key": process.env.private_key.replace(/\\n/g, '\n'),
  "client_email": process.env.client_email,
  "client_id": process.env.client_id,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.client_x509_cert_url
};

var userPermissionApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
let db = userPermissionApp.firestore();

function startSnapshortToken(){
	console.log('startSnapshortToken');
  	db.collection('tokens').onSnapshot(function(snapshot){
     snapshot.forEach((doc) => {
       console.log("New snapshort");
       console.log(doc.id, '=>',doc.data());
       if(doc.id == "authDetails"){
         setTokensFromFirebase(doc.data())
       }
    });
  });
}

async function updateTokens(tokens){
	try{
    await db.collection('tokens').doc("authDetails").set(tokens);
	}
	catch(err){
		console.error(err);
	}
}



module.exports = {getToken, refreshToken,initializeToken};
