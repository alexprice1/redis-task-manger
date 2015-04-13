var crypto = require('crypto');
var taskNameEnum = require('./task-runner/task-enum.js');

function TaskManager(fileManager, redisClient) {
  this.redisClient = redisClient;
  this.fileManager = fileManager;
}

//TO DO: FIx multi client. This is really ugly code.

TaskManager.prototype.add = function(taskName, subTasks, context, callback) {
  var task = this.fileManager.crashIfInvalidFile(taskName);
  var client = this.redisClient.multi();
  this.createMasterTask(client, taskName, subTasks, context).createSubTasks(client).exec(client, function(err) {
    if(err) {
      throw new Error(err);
    }
    callback();
  });
};

TaskManager.prototype.createMasterTask = function(client, taskName, subTasks, context) {
  var hash = randomHash();
  this.hash = hash
  this.taskName = taskName;
  subTasks = subTasks.map(function(task) {
    return {
      args: task,
      context: context || {},
      _status: 'initiated',
      mainTaskName: taskName,
      hash: randomHash(),
      mainTaskHash: hash
    };
  });
  this.subTasks = subTasks;
  client.lpush(taskNameEnum.mainTask(taskName), JSON.stringify({
    name: taskName,
    subTasks: subTasks,
    date: new Date(),
    hash: hash
  }));
  return this;
};

TaskManager.prototype.createSubTasks = function(client, subTasks) {
  var self = this;
  (subTasks || this.subTasks).forEach(function(task) {
    client.lpush(taskNameEnum.subTask.pending(self.taskName, self.hash) , JSON.stringify(task));
  });
  return this;
};


TaskManager.prototype.exec = function(client, fn) {
  client.exec.call(client, fn);
};

module.exports = TaskManager;


function randomHash() {
  var currentDate = (new Date()).valueOf().toString();
  var random = Math.random().toString();
  return crypto.createHash('sha1').update(currentDate + random).digest('hex');
}