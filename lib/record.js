// Copyright 2016 Yahoo Inc.
// Licensed under the terms of the MIT license. Please see LICENSE file in the project root for terms.

var Promise = require('bluebird');
var buffer = require('./buffer');
var path = require('path');
var ejs = require('ejs');
var fs = require('fs');
var debug = require('debug')('mockedapp:record');

/**
 * Read and pre-compile the tape template.
 * @type {Function}
 * @private
 */

var render = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../src/mock.ejs'), 'utf8'));
var renderFunction = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../src/fn.ejs'), 'utf8'));
var renderCurl = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../src/curl.ejs'), 'utf8'));

/**
 * Record the http interaction between `req` and `res` to disk.
 * The format is a vanilla node module that can be used as
 * an http.Server handler.
 * @param {http.ClientRequest} req
 * @param {http.IncomingMessage} res
 * @param {String} filename
 * @returns {Promise.<String>}
 */

module.exports = function (req, res, mockname,mockdirectory) {
  var file,str;
      return buffer(res)
      .then(function (body) {
        debug("Recording result:"+mockname+'.res' ) ;

        {
          file = path.join(mockdirectory, mockname+'.res');
          write(file,body);
        }

        {
          str = renderCurl({ req: req,mockname: mockname,directory: mockdirectory });
          file = path.join(mockdirectory, mockname+'.curl');
          write(file, str);
          debug("Recording curl:"+mockname+'.curl' ) ;
        }
        {
          str = renderFunction({ req: req, res: res, body: body, mockname: mockname ,mockdirectory: mockdirectory });
          file = path.join(mockdirectory, mockname+'.fn');
          write(file, str);
          debug("Recording matching function:"+mockname+'.fn' ) ;
        }
        return render({ req: req, res: res, body: body });
      }).then(function (data) {
        var file = path.join(mockdirectory, mockname);
        return write(file, data);
      }).then(function () {
        var file = path.join(mockdirectory, mockname);
        return file;
      });

};

/**
 * Write `data` to `filename`. Seems overkill to "promisify" this.
 * @param {String} filename
 * @param {String} data
 * @returns {Promise}
 */

function write(filename, data) {
  return Promise.fromCallback(function (done) {
    fs.writeFile(filename, data, done);
  });
}
