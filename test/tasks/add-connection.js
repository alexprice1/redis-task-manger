module.exports = {
  options: {
    allowContext: true
  },
  task: {
    execute: function(email, context, finish) {
      console.log(email, context)
      finish(context.company + ' sent an email to ' + email + '.');
    },
    error: function() {

    }
  },
  finish: {
    execute: function(confirmations) {
    //generateReport
    },
    error: function() {
      //return 
    }
  }
};