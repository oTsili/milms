var async = require('async');
var assert = require('assert');
var logger = require('winston');
var Riak = require('basho-riak-client');

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  level: 'debug',
  colorize: true,
  timestamp: true,
});

var nodes = ['172.17.0.2:8087'];

var unused = new Riak.Client(nodes, function (err, client) {
  logger.info('Now inside Riak.Client');
  client.ping(function (err, rslt) {
    logger.info('Now entered client.ping');
    if (err) {
      logger.info('There is an error encountered in client.ping');
      throw new Error(err);
    } else {
      // On success, ping returns true
      logger.info('client.ping has resulted in success!');
      assert(rslt === true);
    }
    client.stop(function () {
      logger.info('client is stopped');
      process.exit();
    });
  });
});
