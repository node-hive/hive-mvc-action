var hm = require('hive-model');

var dataspace = hm.Dataspace();

require('./articles')(dataspace);

module.exports = dataspace;