var Worker = require('./worker.js');

function WorkerManager(fileManager, redisClient) {
  this.fileManager = fileManager;
  this.redisClient = redisClient;
  this.workers = [];
  this.createWorker();
}

WorkerManager.prototype.createWorker = function() {
  this.workers.push(new Worker(this.fileManager, this.redisClient));
};

module.exports = WorkerManager;