var async = require('async');
var redis = require('redis');
var FileManager = require('./file-manager.js');
var WorkerManager = require('./worker/manager.js');
var TaskManager = require('./task-manager.js');


function RedisTaskManager(options) {
  if(typeof options !== 'object') {
    throw new Error('Must include options object.');
  }
  if(typeof options.connection !== 'object' || !options.connection.port || !options.connection.url || !options.connection.port) {
    throw new Error('Connection string is ill-formated');
  }

  this.options = options;
  this.directory = options.directory || 'tasks';

  this.fileManager = new FileManager(options.directory);
  this.createRedisClient();
  this.taskManager = new TaskManager(this.fileManager, this.redisClient);
  this.WorkerManager = new WorkerManager(this.fileManager, this.redisClient);
}

RedisTaskManager.prototype.add = function() {
  this.add = this.taskManager.add.apply(this.taskManager, arguments);
};

RedisTaskManager.prototype.createRedisClient = function() {
  var self = this;
  var connection = this.options.connection;
  var options = {
    auth_pass: connection.password
  };
  this.redisClient = redis.createClient(connection.port, connection.url, options);

  if(typeof connection.database === 'number') {
    this.redisClient.select(connection.database);
  }
  this.redisClient.on('error', function(err) {
    self.redisClient.end();
    throw new Error(err);
  })
};

module.exports = function(connectionString, options) {
  return new RedisTaskManager(connectionString, options);
};