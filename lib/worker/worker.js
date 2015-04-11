function Worker(fileManager, redisClient) {
  this.fileManager = fileManager;
  this.redisClient = redisClient;
  
  this.setInterval();
  this.poll();
}

Worker.prototype.setInterval = function() {
  var self = this;
  setInterval(function() {
    //-self.poll()
  }, 1000);
};

Worker.prototype.poll = function() {
  console.log('poll');
  var self = this;
  var client = this.redisClient.multi();
  this.fileManager.files.forEach(function(taskName) {
    client.lindex('task:' + taskName, 0);
  });
  client.exec(function(err, mainTasks) {
    if(err) {
      throw new Error(err);
    }
    mainTasks.forEach(function(mainTask) {
      if(mainTask) {
        self.findSubTasks(JSON.parse(mainTasks));
      }
    });
  })
};

Worker.prototype.checkIfTaskIsFinished = function(mainTask) {
  //Compare processed (LRange to smember's info);
  //if not finished, refill unfinished tasks ********************
  var self = this;
  var client = this.redisClient.multi();
  client.lindex('task:' + mainTask.name, 0).smembers('sub-task:' + mainTask.name + ':processed:' + mainTask.hash);
  client.exec(function(err, items){
    //check for error;
    //one null might mean it is completed.

    var mainTask = JSON.parse(items[0]);
    var processedList = items[1];
    var total = processedList.length;
    var index = 0;
    processedList.forEach(function(processedItem) {
      //check difference
      console.log(JSON.parse(processedItem));
    });
    var client = self.redisClient.multi();
    client.del('task:' + mainTask.name).del('sub-task:' + mainTask.name + ':processed:' + mainTask.hash).exec(console.log);
  });
};

Worker.prototype.findSubTasks = function(mainTask) {
  var self = this;
  this.redisClient.lpop('sub-task:' + mainTask.name + ':pending:' + mainTask.hash, function(err, subTaskData) {
    if(err) {
      throw new Error(err);
    }
    if(subTaskData === null) {
      return self.checkIfTaskIsFinished(mainTask);
    }
    var subTask = new SubTask(JSON.parse(subTaskData), self.fileManager, self.redisClient);
    subTask.finishSubTask();
  });
};


function SubTask(data, fileManager, redisClient) {
  this.data = data;
  this.fileManager = fileManager;
  this.redisClient = redisClient;
}

SubTask.prototype.finishSubTask = function() {
  var self = this;
  var subTask = this.data;
  var taskToRun = this.fileManager.get(subTask.mainTaskName);
  taskToRun.contents.task.execute(subTask.args, subTask.context, function(processedData) {
    self.moveSubTaskToProcessed(processedData);
  });
};

SubTask.prototype.moveSubTaskToProcessed = function(processedData) {
  this.data.processedAt = new Date();
  this.data.finalData = processedData;
  this.redisClient.sadd('sub-task:' + this.data.mainTaskName + ':processed:' + this.data.hash, JSON.stringify(this.data), function() {
    console.log('added', arguments);
  });
};

module.exports = Worker;

