var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var chat = require('./routes/chat');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var region;
var user;

app.set( "ipaddr", "127.0.0.1" );
app.set( "port", 30300 );
http.listen(app.get('port'), function(req, res){
    console.log("Express server listening on port " + app.get('port'));
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);
//app.use('/chat', chat);
app.get('/chat', function(req,res){
	region = req.query.region;
	user = req.query.user;
	res.render('chat', {title : 'chat tutorial'});
});


io.on('connection', function(socket){
	var socket_user = {};
	var userRoom = {};
	console.log(socket.id + ' connected - ' + region);
	socket.emit('connect');

	socket.on('join', function(){
		socket_user[socket.id]=user;
		userRoom[socket.id]=region;
	    socket.join(region);
		socket.emit('first', region)
	});

    socket.on('chat message', function(msg){
        io.sockets.in(userRoom[socket.id]).emit('chat message', socket_user[socket.id], msg);
    });  

    socket.on('disconnect', function(){
		socket.leave(userRoom[socket.id]);
		delete socket_user[socket.id];
		console.log('user disconnected');
    });
 
});















// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
