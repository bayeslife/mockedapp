# Mockedapp

This is a utility to support recording and mocking out HTTP interactions

There are 2 modes:

1. Recording: Record and playback HTTP interactions.
2. Mocking: Injecting mcoked HTTP interactions into a server for playback as part of a test case

## install

'npm install' to install dependencies

## usage

The main idea behind Recorder is:

1. Make your client's target host configurable
2. Set up a mocked server locally to proxy the target host (a url is the first required parameter) and specify the mock directory (the second required parameter)
3. Point your client at the mockedapp server.

Then develop or run your tests. If a recorded HTTP request is found on disk, it will be played back instead of hitting the target host. If no recorded request is found, the request will be forwarded to the target host and recorded to disk.

The main idea behind Mocker is

1. Modify the responses recorded and the matching criteria to suit a test case
2. At the start of a test case inject the mocks into the server
3. Run the test case and the server will return the mocks

## Recording

### Recording options

Mocks are recorded into a mocks directory (which is a command line parameter).
As requests are recorded 3 separate files are created.

1. A curl file to inject the mock into the Mocker when running in that mode
2. A function file which matches the request that was recorded.  This can be modified to have the mock be returned when the request will be different in some way from when originally recorded
3. A response file which is the body of the response. This can be modified to return different data.

On each subsequent identical request the mock is returned during recording operations.

### Command line

`node recorder.js <url> <mocks directory>`

see recorder.sh for an example

In the following sample the server activity is logged as we perform the same request 3 times.

``` bash
$ DEBUG=mockedapp:recorder,mockedapp:server,mockedapp:record node recorder.js http://localhost:80 /tmp/mocks
  mockedapp:recorder Forwarding to:http://localhost:80 +0ms
  mockedapp:recorder Recording mocks into:/tmp/mocks +3ms
Listening on port: 3000


//Here we submitted the request via 'curl  -X GET --data "foobar" http://localhost:3000/foo?foo=bar'
  mockedapp:server req +3s /foo?foo=bar
  mockedapp:server serving response from file +22ms /tmp/mocks/c249dedf870e294e2f0a5cba2ea494d1
  mockedapp:record Recording result:c249dedf870e294e2f0a5cba2ea494d1.res +29ms //This will contain the response from http://localhost:80
  mockedapp:record Recording curl:c249dedf870e294e2f0a5cba2ea494d1.curl +2ms //This is a curl command to push the response into Mocker
  mockedapp:record Recording matching function:c249dedf870e294e2f0a5cba2ea494d1.fn +0ms //This is a javascript function which you may or may not want to change.

//The recorder will return the recorded result if it sees the same request again.
  mockedapp:server req +4s /foo?foo=bar
  mockedapp:server serving response from file +1ms /tmp/mocks/c249dedf870e294e2f0a5cba2ea494d1

  mockedapp:server req +731ms /foo?foo=bar
  mockedapp:server serving response from file +1ms /tmp/mocks/c249dedf870e294e2f0a5cba2ea494d1
```

## Mocking

### Command line

`node mocker.js <mocks directory>`

see mocker.sh for an example

```bash
$ DEBUG=mockedapp:mocker,mockedapp:responses node mocker.js `pwd`/mocks
      Mockedapp:mocker listening on port 3000!

      //If we send in a request before any response is injected  
        mockedapp:responses find response for request +0ms
      [Error: No response found]
        mockedapp:mocker No suitable response found +15ms

      //Here we inject a couple different responses                
        mockedapp:responses Parse as function +2ms
        mockedapp:responses Adding response +4s //This is a response for /foo
        mockedapp:responses Adding response +4s //This is a response for /foo2

      //Here we send in a request via 'curl  -X GET --data "foobar" http://localhost:3000/foo2?foo=bar'
        mockedapp:responses Parse as function +0ms
        mockedapp:responses find response for request +4s
        mockedapp:responses c249dedf870e294e2f0a5cba2ea494d1 +0ms
      url mismatch:/foo2?foo=bar vs /foo?foo=bar
        mockedapp:responses Handler failed:c249dedf870e294e2f0a5cba2ea494d1 +1ms
        mockedapp:responses 7ee06108a75a5f97681e98b628498e4f +0ms
        mockedapp:responses Handler7ee06108a75a5f97681e98b628498e4f +1ms
        mockedapp:responses find response for request +5s
        mockedapp:responses c249dedf870e294e2f0a5cba2ea494d1 +0ms
        mockedapp:responses Handlerc249dedf870e294e2f0a5cba2ea494d1 +1ms

     //The mocked response for /foo2 is returned to the curl
```

## Inspiration

This utility is a fork of [yakbak][1]
The [nock][3] functionality was also considered.


[1]: https://www.npmjs.com/package/yakbak
[2]: http://code.flickr.net/2016/04/25/introducing-yakbak-record-and-playback-http-interactions-in-nodejs/
[3]: https://github.com/node-nock/nock
