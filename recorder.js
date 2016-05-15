var debug = require('debug')('mockedapp:recorder');

var http = require('http');
var recorder = require('./lib/server.js');

try {
  if (!process.argv[2]) {
    throw new Error('url is required');
  }

  if (!process.argv[3]) {
    throw new Error('mocks directory is required');
  }

  var url = process.argv[2];
  debug('Forwarding to:'+url);

  var mockdir = process.argv[3];
  debug('Recording mocks into:'+mockdir);

  http.createServer(recorder(url, {
      dirname: mockdir
  })).listen(3000);

  console.log('Listening on port: 3000')

}catch(exception){
  console.log(exception);
}
