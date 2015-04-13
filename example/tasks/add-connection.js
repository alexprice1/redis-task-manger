module.exports = {
  options: {
    allowContext: true
  },
  task: {
    execute: function(email, context, callback) {
      callback(context.company + ' sent an email to ' + email + '.');
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