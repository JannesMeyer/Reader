// Modules
var express = require('express');
var LessMiddleware = require('less-middleware');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;

// Create server object
var app = module.exports = express.createServer();

// Configuration
var public_dir = __dirname + '/public';
app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	
	app.use(app.router);
});
app.configure('development', function() {
	app.use(LessMiddleware({ src: public_dir, force: true }));
	app.use(express.static(public_dir));

	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function() {
	app.use(LessMiddleware({ src: public_dir, compress: true }));
	var oneYear = 31557600000;
	app.use(express.static(public_dir, { maxAge: oneYear }));
	
	app.use(express.errorHandler());
});

// Persistence
var client = new Db('reader', new Server('127.0.0.1', 27017, {}));
client.open(function(err, db) {
	console.log('Connected to MongoDB');

	// Routes
	var routes = require('./routes')(app, db);

	/*db.collection('users', function(err, users) {
		if (err) {
			console.log('Couldn\'t find the collection');
			return;
		}
		users.insert({
			name: 'test',
			password: 'test',
			feeds: []
		});
	});*/
});

//var FeedProvider = require('./providers/feed_provider');

// Start server
app.listen(3000, function() {
	console.log("%s server on http://localhost:%d/", app.settings.env, app.address().port);
});