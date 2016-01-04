var crypto = require('crypto');

var hash = {};

hash.createhash = function()
{
	var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    var hash=crypto.createHash('sha1').update(current_date + random).digest('hex');
    return hash;
}

hash.encrypt = function(text) {
  var cipher = crypto.createCipher('aes-256-cbc', 'ToDoapp')
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
hash.decrypt = function(text) {
  var decipher = crypto.createDecipher('aes-256-cbc', 'ToDoapp')
  var decrypted = decipher.update(text,'hex','utf8')
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = hash;