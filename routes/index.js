'use strict';
var error = require('./error');
var share = require('./share');
var user = require('./user');

var send_ok = function(req, res, next) {
  res.sendStatus(200);
};

module.exports = function(app) {
  //check if server's health is good or not
  app.get('/_status', send_ok);
 
  // to get all user list
  app.get('/users/list', user.verify, user.listing, user.listResponse, error);
  app.get('/user/session', user.verify, user.getSession, error);
  
  app
  .post('/user/login', user.get, user.loginVerify, user.buildSession, user.response, error)
  .post('/user/signup', user.addnew, user.buildSession, user.response, error)
  .post('/user/logout', user.verify, user.destroySession, user.response, error)
  .post('/user/checksession', user.verify, user.response, error);
  
  
  app
  .get('/share', user.verify, share.get, share.response, error)
  .get('/share/summary', user.verify, share.summary, share.response, error)
  .post('/share', user.verify, share.insert, share.response, error)
  .put('/share/:id', user.verify, share.hasPermission, share.update, share.response, error)
  .delete('/share/:id', user.verify, share.hasPermission, share.del, share.response, error);
};
