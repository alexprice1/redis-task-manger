var TaskRunner = require('../task-runner/runner.js');

function Worker(taskName, fileManager, redisClient) {
  var self = this;
  this.taskRunner = new TaskRunner(taskName, fileManager, redisClient);
  setInterval(function() {
    self.poll();
  }, 1000);
}

Worker.prototype.poll = function() {
  this.taskRunner.run();
};

module.exports = Worker;

