var Promise = require('bluebird');

/**
 * Collect `stream`'s data in to an array of Buffers.
 * @param {stream.Readable} stream
 * @returns {Promise.<Array>}
 */
module.exports = function buffer(stream) {
  return new Promise(function (resolve, reject) {
    var data = [];

    stream.on('data', function (buf) {
      data.push(buf);
    });

    stream.on('error', function (err) {
      reject(err);
    });

    stream.on('end', function () {
      resolve(data);
    });
  });
};
