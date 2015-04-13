var RedisTaskManager = require('../lib/index.js');

var redisTaskManager = new RedisTaskManager({
  directory: __dirname + '/tasks',
  connection: {
    url: "127.0.0.1",
    password: "",
    port: 6379,
    database: 0,
  }
});
//inserts into db, returns status
redisTaskManager.add('add-connection', ['alex+1@tourconnect.com', 'alex+2@tourconnect.com', 'alex+3@tourconnect.com'], {
  company: 'Australia'
}, function() {
  console.log('added');
});