'use strict';

var http = require('http');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var config = require('./config');
var user = require('./routes/user');
var app = express();
var router = express.Router();

//get port from env and store
var port = process.env.PORT || 9876;
var env = process.env.NODE_ENV || 'development';
app.set('port', port)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  resave: true,
  saveUninitialized: true,
  key: 'myShare.sid',
  secret: 'myshare',
  store: new RedisStore({
    host: config.session.host,
    port: config.session.port,
    ttl: 2*24*60*60
  })
}));


if (env.toLowerCase() === 'production') {  
  logger.token('istDate', function () {
    return new Date();
  });
} else {
  app.use(logger('dev'));
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(router);

require('./routes')(router);

app.get('/login', function(req, res) {
  res.render('login');
});
app.get('*', function(req, res) {
    res.render('index');
});

var server = http.createServer(app);

server.listen(port, listenHandler);
server.on('error', errorHandler);

function errorHandler(error) {
  switch(error.code) {
    case 'EACCES':
      console.error('requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(port + ' is already in use');
      process.exit(1);
      break
    default:
      throw error;
  }
}

function listenHandler() {
  console.log('TODO: server running on port: ' +  port + ' in ' + env);
}
module.exports = app;
