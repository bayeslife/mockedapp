var Promise = require('bluebird');
var hash = require('incoming-message-hash');
var assert = require('assert');
var mkdirp = require('mkdirp');
var path = require('path');
var buffer = require('./buffer');
var proxy = require('./proxy');
var record = require('./record');
var debug = require('debug')('mockedapp:server');

/**
 * Returns a new proxy middleware.
 * @param {String} host The hostname to proxy to
 * @param {Object} opts
 * @param {String} opts.dirname The mocks directory
 * @returns {Function}
 */

module.exports = function (host, opts) {
  assert(opts.dirname, 'You must provide opts.dirname');

  return function (req, res) {
    mkdirp.sync(opts.dirname);

    debug('req', req.url);

    buffer(req).then(function (body) {
      req.body = body.toString();
      var mocknm = mockname(req, body)

      var file = path.join(opts.dirname, mocknm);
      debug('serving response from file', file);

      return Promise.try(function () {
        return require.resolve(file);
      }).catch(ModuleNotFoundError, function (/* err */) {
        return proxy(req, body, host).then(function (res) {
          return record(req, res, mocknm,opts.dirname);
        });
      });

    })
    .then(function (file) {
      return require(file);
    }).then(function (tape) {
      return tape(req, res);
    });

  };

};

/**
 * Returns the mock name for `req`.
 * @param {http.IncomingMessage} req
 * @param {Array.<Buffer>} body
 * @returns {String}
 */

function mockname(req, body) {
  return hash.sync(req, Buffer.concat(body));
}

/**
 * Bluebird error predicate for matching module not found errors.
 * @param {Error} err
 * @returns {Boolean}
 */

function ModuleNotFoundError(err) {
  return err.code === 'MODULE_NOT_FOUND';
}
