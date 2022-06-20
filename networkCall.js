const unirest = require('unirest');
/*
 *  For doing the http get call
 */
const doGetCall = (url,header) => {
  console.log("doGetCall");
  console.log(header);
  return new Promise(async (resolve,reject)=>{
     unirest('GET', url)
     .headers(header)
     .end(function(res) {
       if (res.error) {
         console.log('GET error') ;
          return reject(res.error);
       }
       else {
         console.log("GET resolve done for url");
         return resolve(res);
      }
     });
  });
};

/*
 *  For doing the http post call
 */
const doPostURLEncodedCall = (url,header,body) => {
  console.log("doPostURLEncodedCall");
  return new Promise(async (resolve,reject)=>{
    var request = unirest('POST', url)
                   .headers(header)
    for(key in body){
      var string = key+'='+body[key];
      request.send(string)
    }
    request
    .end(function (res) {
      if (res.error) {
        console.log('POST error') ;
         return reject(res.error);
      }
      else {
        console.log("POST resolve done for url");
        return resolve(res);
     }
    })
  });
};

/*
 *  For doing the http post call
 */
const doPostCall = (url,header,body) => {
  console.log("doPostCall");
  return new Promise(async (resolve,reject)=>{
    // console.log(url);
    // console.log(header);
    // console.log(body);
    // console.log(body.actions[0].command);
    // return resolve()
    unirest('POST', url)
      .headers(header)
      .send(JSON.stringify(body))
      .end(function (res) {
        if (res.error) {
          console.log('POST error') ;
          return reject(res.error);
        }
        else {
          console.log("POST resolve done for url");
          return resolve(res);
        }
      })
  });
};

module.exports = {doGetCall ,doPostURLEncodedCall, doPostCall};
