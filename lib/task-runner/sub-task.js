var taskNameEnum = require('./task-enum.js');

function SubTask(task, fileManager, redisClient) {
  this.task = task;
  this.fileManager = fileManager;
  this.redisClient = redisClient;
  this.subTaskProcessedKey = taskNameEnum.subTask.processed(task.mainTaskName, task.mainTaskHash);
}

SubTask.prototype.finish = function() {
  var self = this;
  var subTask = this.task;
  var taskToRun = this.fileManager.get(subTask.mainTaskName);
  taskToRun.contents.task.execute(subTask.args, subTask.context, function(processedData) {
    self.moveSubTaskToProcessed(processedData);
  });
};

SubTask.prototype.moveSubTaskToProcessed = function(processedData) {
  this.task.processedAt = new Date();
  this.task.finalData = processedData;
  this.redisClient.sadd('sub-task:' + this.task.mainTaskName + ':processed:' + this.task.mainTaskHash, JSON.stringify(this.task), function() {
  });
};

module.exports = SubTask;