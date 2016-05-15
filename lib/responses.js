var buffer = require('./buffer');
var debug = require('debug')('mockedapp:responses');

var responseset = {};

var add = function (requestId,req) {
  return buffer(req).then(function (body) {
    debug('Adding response');
    debug(body.toString());
    var fn = eval(body.toString());
    debug('Parse as function');
    //console.log(fn());
    responseset[requestId]=fn;
    return 'recorded';
  });
};

var get = function (req,res) {
  debug('find response for request');
  var respset = responseset;
  var response = res;
  return buffer(req)
  .then(function (body) {
     req.body = body.toString();
     var keys = Object.keys(respset);
     for(var i=0;i<keys.length;i++){
       var key = keys[i];
       var handler = respset[key];
       debug(key);
       if(handler(req,response)){
         debug('Handler'+key);
         return true;
       } else {
          debug('Handler failed:'+key);
       }
     }
  throw new Error("No response found");
  });
};

module.exports = {
  add: add,
  get: get
}
