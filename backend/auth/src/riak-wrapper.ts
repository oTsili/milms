var logger = require('winston');
const Riak = require('basho-riak-client');

class RiakWrapper {
  private queryStorage;
  private writeStorage;

  get queryClient() {
    if (!this.queryStorage) {
      throw new Error('Cannot access RIAK query client before connecting');
    }

    return this.queryStorage;
  }
  get writeClient() {
    if (!this.writeStorage) {
      throw new Error('Cannot access RIAK write client before connecting');
    }

    return this.writeStorage;
  }

  connectQueryNode(nodes: string[]) {
    return new Promise<void>((resolve, reject) => {
      this.queryStorage = new Riak.Client(nodes, function (err, c) {
        if (err) {
          logger.error('RIAK Query Client could not be connected');
          reject(err);
        } else {
          // 'this.queryStorage' and 'c' are the same object
          logger.info('Connected: RIAK Query Client');
          // console.log(c);
          resolve();
        }
      });
    });
  }

  connectWriteNode(nodes: string[]) {
    return new Promise<void>((resolve, reject) => {
      this.writeStorage = new Riak.Client(nodes, function (err, c) {
        if (err) {
          logger.error('RIAK Write Client could not be connected');
          reject(err);
        }
        // 'this.queryStorage' and 'c' are the same object
        logger.info('Connected: RIAK Write Client');
        // console.log(c);
        resolve();
      });
    });
  }
}

export const riakWrapper = new RiakWrapper();
