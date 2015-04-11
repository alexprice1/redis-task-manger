var crypto = require('crypto');

function TaskManager(client) {
  this.client = client;
}

TaskManager.prototype.createMasterTask = function(taskName, subTasks, context) {
  this.hash = randomHash();
  this.taskName = taskName;
  subTasks = subTasks.map(function(task) {
    return {
      args: task,
      context: context || {},
      _status: 'initiated',
      mainTaskName: taskName,
      hash: this.hash
    };
  });
  this.subTasks = subTasks;
  this.client.lpush('task:' + taskName, JSON.stringify({
    name: taskName,
    subTasks: subTasks,
    date: new Date(),
    hash: this.hash
  }));
  return this;
};

TaskManager.prototype.createSubTasks = function() {
  var self = this;
  this.subTasks.forEach(function(task) {
    self.client.lpush('sub-task:' + self.taskName + ':' + self.hash, JSON.stringify(task));
  });
  return this;
};


TaskManager.prototype.exec = function() {
  this.client.exec.apply(this.client, arguments);
};

module.exports = TaskManager;


function randomHash() {
  var currentDate = (new Date()).valueOf().toString();
  var random = Math.random().toString();
  return crypto.createHash('sha1').update(currentDate + random).digest('hex');
}