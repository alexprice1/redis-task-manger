module.exports = {
  options: {
    allowContext: true
  },
  task: {
    execute: function(email, context, callback) {
      setTimeout(function() {
        callback(context.company + ' sent an email to ' + email + '.');
      }, 2000);
    },
    error: function() {

    }
  },
  finish: {
    execute: function(finishedItems, originalEmails, context, callback) {
      console.log(finishedItems, 'done');
      callback();
      return;

    },
    error: function() {
      //return 
    }
  }
};