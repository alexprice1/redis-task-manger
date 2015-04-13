var MainTask = require('./main-task');

function TaskRunner(taskName, fileManager, redisClient) {
  this.taskName = taskName;
  this.fileManager = fileManager;
  this.redisClient = redisClient;
}

TaskRunner.prototype.run = function() {
  var self = this;
  var client = this.redisClient.multi();
  client.lindex('task:' + this.taskName, 0);
  client.exec(function(err, mainTask) {
    if(err) {
      throw new Error(err);
    }
    mainTask = mainTask[0];
    if(mainTask) {
      mainTask = new MainTask(JSON.parse(mainTask), self.fileManager, self.redisClient);
      mainTask.tryNextSubTaskOrFinishTask();
    }
  })
};

module.exports = TaskRunner;