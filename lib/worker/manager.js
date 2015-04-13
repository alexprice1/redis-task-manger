var Worker = require('./worker.js');

function WorkerManager(fileManager, redisClient) {
  this.fileManager = fileManager;
  this.redisClient = redisClient;
  this.workers = {};
  this.createWorkers();
}

WorkerManager.prototype.createWorkers = function() {
  var self = this;
  this.fileManager.files.forEach(function(taskName) {
    self.workers[taskName] = new Worker(taskName, self.fileManager, self.redisClient);
  });
  
};

module.exports = WorkerManager;