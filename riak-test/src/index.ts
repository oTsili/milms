var async = require('async');
var assert = require('assert');
var logger = require('winston');
var Riak = require('basho-riak-client');
var async = require('async');

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  level: 'debug',
  colorize: true,
  timestamp: true,
});

var nodes = ['172.17.0.2:8087'];

var client = new Riak.Client(nodes, function (err, client) {
  logger.info('Now inside Riak.Client');
  // client.ping(function (err, rslt) {
  //   logger.info('Now entered client.ping');
  //   if (err) {
  //     logger.info('There is an error encountered in client.ping');
  //     throw new Error(err);
  //   } else {
  //     // On success, ping returns true
  //     logger.info('client.ping has resulted in success!');
  //     assert(rslt === true);
  //   }
  //   client.stop(function () {
  //     logger.info('client is stopped');
  //     process.exit();
  //   });
  // });
});

var people = [
  {
    emailAddress: 'bashoman@riak.com',
    firstName: 'Riak',
    lastName: 'Man',
  },
  {
    emailAddress: 'johndoe@gmail.com',
    firstName: 'John',
    lastName: 'Doe',
  },
];

var storeFuncs: ((async_cb: any) => void)[] = [];
people.forEach(function (person) {
  // Create functions to execute in parallel to store people
  storeFuncs.push(function (async_cb) {
    client.storeValue(
      {
        bucket: 'contributors',
        key: person.emailAddress,
        value: person,
      },
      function (err, rslt) {
        async_cb(err, rslt);
      }
    );
  });
});

async.parallel(storeFuncs, function (err, rslts) {
  if (err) {
    throw new Error(err);
  }
});

client.fetchValue(
  { bucket: 'contributors', key: 'bashoman@riak.com', convertToJs: true },
  function (err, rslt) {
    if (err) {
      throw new Error(err);
    } else {
      console.log(rslt);
      var riakObj = rslt.values.shift();
      var bashoman = riakObj.value;
      logger.info("I found %s in 'contributors'", bashoman.emailAddress);
    }
  }
);
