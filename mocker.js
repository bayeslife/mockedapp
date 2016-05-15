
var debug = require('debug')('mockedapp:mocker')

try {
  if (!process.argv[2]) {
    throw new Error('mock directory is required');
  }

  var mockdirectory = process.argv[2];

  var express = require('express');
  var bodyParser = require('body-parser');

  var responses = require('./lib/responses');

  var app = express();

  app.use(bodyParser.json()); // for parsing application/json

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.post('/response/:responseId', function (req, res) {
    responses.add(req.params.responseId,req)
    .then(function(){
      res.status(200).send("Response added");
    })
    .catch(function(ex){
      debug('Unable add response',ex);
      res.status(500).send('Unable to add response'+ ex);
    });
  });

  var respond = function (req, res) {
    responses.get(req,res,mockdirectory)
    .then(function(response){
      //need to update the res from the response;
      res.send();
    })
    .catch(function(ex){
      console.log(ex);
      debug('No suitable response found');
      res.status(404).send('No suitable response found');
    });
  }

  app.post('/*', respond);
  app.get('/*', respond);

  app.listen(3000, function () {
    console.log('Mockedapp:mocker listening on port 3000!');
  });

}catch(ex){
  console.log(ex);
}
