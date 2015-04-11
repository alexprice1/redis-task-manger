var fs = require('fs');
function FileManager(directory) {
  var self = this;
  this.filesHash = {};
  this.files = [];
  var files = fs.readdirSync(directory);
  //verify file structure
  files.forEach(function(file) {
    var fileName = file.split('.js')[0];
    var fileDirectory = directory + '/' + file;
    var fileContents = require(fileDirectory);
    var stats = fs.statSync(fileDirectory);
    self.files.push(fileName);
    self.filesHash[fileName] = {
      contents: fileContents,
      isDirectory: stats.isDirectory(),
      fileName: fileName
    };
  });
}

FileManager.prototype.crashIfInvalidFile=
FileManager.prototype.get = function(fileName, cb) {
  var file = this.filesHash[fileName];
  if(!file) {
    throw new Error(fileName + ' is not in the directory specified.');
  }
  if(file.isDirectory) {
    throw new Error(fileName + ' is a directory');
  }
  return file;
};

module.exports = FileManager;