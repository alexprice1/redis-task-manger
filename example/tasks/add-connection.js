var sendgrid = require('sendgrid')('app11605236@heroku.com', 'kl0bxcba');

module.exports = {
  options: {
    allowContext: true
  },
  task: {
    execute: function(email, context, callback) {
      sendgrid.send({
        to: email,
        toname: context.company || '',
        from: 'support@tourconnect.com',
        html: 'Connected!',
        subject: 'Connected!'
      }, function(error, response) {
        console.log(error, response);
        callback(context.company + ' sent an email to ' + email + '.');
      });
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