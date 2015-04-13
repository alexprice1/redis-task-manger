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
return;
//inserts into db, returns status
redisTaskManager.add('add-connection', ['alex@1.com', 'alex@3.com', 'alex@2.com'], {
  company: 'Australia'
}, function() {
  console.log('added');
});