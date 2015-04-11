var TaskManager = require('./helpers/task-manager');

function Task(fileManager, redisClient) {
  this.fileManager = fileManager;
  this.redisClient = redisClient;
}

Task.prototype.add = function(taskName, subTasks, context, callback) {
  var task = this.fileManager.crashIfInvalidFile(taskName);
  var client = this.redisClient.multi();
  var taskManager = new TaskManager(client);
  taskManager.createMasterTask(taskName, subTasks, context).createSubTasks().exec(function(err) {
    if(err) {
      throw new Error(err);
    }
    callback();
  });
};

module.exports = Task;