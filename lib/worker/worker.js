function Worker(fileManager, redisClient) {
  this.fileManager = fileManager;
  this.redisClient = redisClient;
  this.poll();
}

Worker.prototype.poll = function() {
  var self = this;
  var client = this.redisClient.multi();
  this.fileManager.files.forEach(function(taskName) {
    client.lindex('task:' + taskName, 1);
  });
  client.exec(function(err, mainTasks) {
    if(err) {
      throw new Error(err);
    }
    mainTasks.forEach(function() {
      self.findSubTaks(JSON.parse(mainTasks));
    });
  })
};

Worker.prototype.checkIfTaskIsFinished = function() {
  //Compare processed (LRange to smember's info);
  //if not finished, refill unfinished tasks
};

Worker.prototype.findSubTaks = function(mainTask) {
  var self = this;
  this.redisClient.lpop('sub-task:' + mainTask.name + ':' + mainTask.hash, function(err, subTaskData) {
    if(err) {
      throw new Error(err);
    }
    if(!subTaskData) {
      self.checkIfTaskIsFinished();
    }
    var subTask = new SubTask(JSON.parse(subTaskData), self.fileManager);
    subTask.finishSubTask();
  });
};


function SubTask(data, fileManager, redisClient) {
  this.data = data;
  this.fileManager = fileManager;
}

SubTask.prototype.finishSubTask = function() {
  var subTask = this.data;
  var taskToRun = this.fileManager.get(subTask.mainTaskName);
  taskToRun.contents.task.execute(subTask.args, subTask.context, function(finalDocument) {
    console.log(finalDocument);
  });
};

SubTask.prototype.moveSubTaskToProcessed = function() {

};

module.exports = Worker;