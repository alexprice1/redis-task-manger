var SubTask = require('./sub-task');
var TaskManager = require('../task-manager.js');
var taskNameEnum = require('./task-enum.js');

function MainTask(taskObject, fileManager, redisClient) {
  this.task = taskObject;
  this.fileManager = fileManager;
  this.redisClient = redisClient;
  this.name = taskObject.name;
  this.mainTaskKey = taskNameEnum.mainTask(taskObject.name);
  this.finishedKey = taskNameEnum.subTask.finished(taskObject.name, taskObject.hash);
  this.subTaskPendingKey = taskNameEnum.subTask.pending(taskObject.name, taskObject.hash);
  this.subTaskProcessedKey = taskNameEnum.subTask.processed(taskObject.name, taskObject.hash);
  this.lockedKey = taskNameEnum.subTask.locked(taskObject.name, taskObject.hash);
}

MainTask.prototype.tryNextSubTaskOrFinishTask = function() {
  var self = this;
  this.redisClient.lpop(self.subTaskPendingKey, function(err, subTaskData) {
    if(err) {
      throw new Error(err);
    }
    if(subTaskData === null) {
      return self.finish();
    }
    var subTask = new SubTask(JSON.parse(subTaskData), self.fileManager, self.redisClient);
    subTask.finish();
  });
};

MainTask.prototype.finish = function(mainTask) {
  var self = this;
  
  var client = this.redisClient.multi();

  client.lindex('task:' + this.name, 0);
  client.smembers(this.subTaskProcessedKey);
  client.set(self.lockedKey, 'temp', 'NX').del(self.lockedKey);
  client.exec(function(err, items){
    if(err) {
      throw new Error(err);
      return;
    }
    var mainTask = JSON.parse(items[0]);
    var processedList = items[1];
    if(items[2] === null) {

      //is checked out.
      return;
    }
    
    var total = processedList.length;
    var index = 0;
    var compareHash = {};
    var subTasks = JSON.parse(JSON.stringify(mainTask.subTasks));
    var finishedItems = [];
    var originalItems = [];
    for(var i = subTasks.length; i--; ){
      var subTask = subTasks[i];
      processedList.forEach(function(processedItem) {
        var item = JSON.parse(processedItem);
        if(item.hash === subTask.hash) {
          finishedItems.push({
            finished: item.finalData,
            original: item.args
          });
          originalItems.push(item.args);
          subTasks.splice(i, 1);
        }
      });
    }
    if(subTasks.length) {
      //Need to look at indivual tasks
      if(new Date() - new Date(mainTask.date) < 60000) {
        return;
      }
      var multi = self.redisClient.multi();
      var taskManager = new TaskManager(self.fileManager, self.redisClient);
      taskManager.taskName = mainTask.name;
      taskManager.hash = mainTask.hash;
      taskManager.createSubTasks(multi, subTasks).exec(multi, function(err) {
        if(err) {
          throw new Error(err);
        }
      });
    } else {
      var client = self.redisClient.multi();

      client.set(self.lockedKey, self.subTaskProcessedKey, 'NX', 'PX', 6000).get(self.finishedKey).exec(function(err, items) {
        if(err) {
          throw new Error(err);
        }
        if(items[0] === null) {
          return;
        } else if(items[1]) {
          self.removeFromProcessedAndMainTask();
        }
        var taskToRun = self.fileManager.get(mainTask.name);
        taskToRun.contents.finish.execute(finishedItems, originalItems, mainTask.context, function() {
          self.removeFromProcessedAndMainTask();
        });
      });
    }
  });
};

MainTask.prototype.removeFromProcessedAndMainTask = function() {
  var client = this.redisClient.multi();
  client.lrem(this.mainTaskKey, 0, JSON.stringify(this.task)).del(this.subTaskPendingKey).set(this.finishedKey, this.task.hash).exec(function(err) {
    if(err) {
      throw new Error(err);
    }
  });
}

module.exports = MainTask;
