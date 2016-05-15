# mockedapp

There are 2 modes:

1. Recording: Record and playback HTTP interactions.
2. Mocking: Injecting mcoked HTTP interactions into a server for playback as part of a test case

## install

unzip
'npm install' to install dependencies

## usage

The main idea behind Recording HTTP clients with mockedapp is:

1. Make your client's target host configurable.
2. Set up a mocked server locally to proxy the target host.
3. Point your client at the mockedapp server.

Then develop or run your tests. If a recorded HTTP request is found on disk, it will be played back instead of hitting the target host. If no recorded request is found, the request will be forwarded to the target host and recorded to disk.

The main idea behind Mocking is to start the server

1. Record interactions using the first mode then
2. Modify the responses record and the matching criteria to suit a test case
3. At the start of a test case inject the mocks into the server
4. Run the test case and the server will return the mocks

## Recording

### Recording options

Mocks are recorded into the mocks directory.
On each subsequent identical request the mock is returned during recording operations.
Three separate files are recorded alongside the recorded response.

1. A curl file to inject the mock into the mock server
2. A function file which matches the request that was recorded.  This can be modified to have the mock be returned when the request will be different in some way from when originally recorded
3. A response file which is the body of the response. This can be modified to return different data.

### Command line

`node recorder.js <url> <mocks directory>`

In the following sample the server activity is logged as we perform the same request 3 times.

``` bash
$ DEBUG=mockedapp:recorder,mockedapp:server,mockedapp:record node recorder.js http://localhost:80 /tmp/mocks
  mockedapp:recorder Forwarding to:http://localhost:80 +0ms
  mockedapp:recorder Recording mocks into:/tmp/mocks +3ms
Listening on port: 3000
  mockedapp:server req +3s /foo?foo=bar
  mockedapp:server serving response from file +22ms /tmp/mocks/c249dedf870e294e2f0a5cba2ea494d1
  mockedapp:record Recording result:c249dedf870e294e2f0a5cba2ea494d1.res +29ms
  mockedapp:record Recording curl:c249dedf870e294e2f0a5cba2ea494d1.curl +2ms
  mockedapp:record Recording matching function:c249dedf870e294e2f0a5cba2ea494d1.fn +0ms
  mockedapp:server req +4s /foo?foo=bar
  mockedapp:server serving response from file +1ms /tmp/mocks/c249dedf870e294e2f0a5cba2ea494d1
  mockedapp:server req +731ms /foo?foo=bar
  mockedapp:server serving response from file +1ms /tmp/mocks/c249dedf870e294e2f0a5cba2ea494d1
```

## Mocking

### Command line

`node mocker.js`

```bash
$ DEBUG=mockedapp:recorder,mockedapp:server,mockedapp:record node recorder.js http://localhost:80 /tmp/mocks
  mockedapp:recorder Forwarding to:http://localhost:80 +0ms
  mockedapp:recorder Recording mocks into:/tmp/mocks +3ms
Listening on port: 3000
  mockedapp:server req +3s /foo?foo=bar
  mockedapp:record Recording result:/tmp/mocks/c249dedf870e294e2f0a5cba2ea494d1.res +48ms
  mockedapp:record Recording curl:/tmp/mocks/c249dedf870e294e2f0a5cba2ea494d1.curl +1ms
  mockedapp:record Recording matching function:/tmp/mocks/c249dedf870e294e2f0a5cba2ea494d1.fn +1ms
  mockedapp:server req +3s /foo?foo=bar
  mockedapp:server req +657ms /foo?foo=bar
```


## Inspiration

This utility is a fork of [yakbak][1]
The [nock][3] functionality was also considered.

## References

[1]: https://www.npmjs.com/package/yakbak
[2]: http://code.flickr.net/2016/04/25/introducing-yakbak-record-and-playback-http-interactions-in-nodejs/
[3]: https://github.com/node-nock/nock
