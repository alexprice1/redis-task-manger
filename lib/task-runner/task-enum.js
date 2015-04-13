module.exports = {
  mainTask: function(name) {
    return 'task:' + name;
  },
  subTask: {
    pending: function(name, hash) {
      return 'sub-task:' + name + ':pending:' + hash;
    },
    processed: function(name, hash) {
      return 'sub-task:' + name + ':processed:' + hash
    },
    locked: function(name, hash) {
      var name = this.pending(name, hash);
      if(!name) {
        return name;
      } else {
        return name + 'locked';
      }
    }
  }
};